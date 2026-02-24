'use server'

import { prisma } from './prisma'
import { createSession, verifyPassword, hashPassword, deleteSession, verifySession } from './auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { sendWelcomeEmail } from './email-resend'
import { getPlanLimit } from './plans'

// Logger helper
function logEvent(event: string, details: any) {
    const timestamp = new Date().toISOString()
    console.log(`[LOG] ${timestamp} | EVENT: ${event} | DETAILS: ${JSON.stringify(details)}`)
}

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) return { error: 'Email and password are required' }

    const user = await prisma.user.findUnique({
        where: { email },
        include: { subscription: true }
    })

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
        logEvent('LOGIN_FAILED', { email, reason: 'Invalid credentials' })
        return { error: 'Invalid credentials' }
    }

    // Check subscription
    if (user.subscription) {
        const isExpired = user.subscription.status === 'EXPIRED' ||
            (user.subscription.status === 'TRIAL' &&
                user.subscription.trialEndDate &&
                new Date(user.subscription.trialEndDate) < new Date())

        if (isExpired) {
            logEvent('LOGIN_RESTRICTED', { userId: user.id, reason: 'Subscription expired' })
            return { error: 'Sua conta está expirada. Por favor, selecione um plano para continuar.', expired: true }
        }
    }

    await createSession(user.id)
    logEvent('LOGIN_SUCCESS', { userId: user.id, email: user.email })
    redirect('/dashboard')
}


export async function register(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    if (!email || !password || !name) return { error: 'All fields are required' }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return { error: 'Email already registered' }

    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 3)

    // Generate slug from name
    const baseSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    let slug = baseSlug

    // Check if slug exists
    const slugExists = await prisma.user.findUnique({ where: { slug } })
    if (slugExists) {
        slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`
    }

    const user = await prisma.user.create({
        data: {
            email,
            name,
            slug: slug,
            passwordHash: await hashPassword(password),
            subscription: {
                create: {
                    status: 'TRIAL',
                    trialEndDate: trialEnd,
                    startDate: new Date(),
                },
            },
        },
    })

    await createSession(user.id)

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name || 'Usuário')

    logEvent('USER_REGISTERED', { userId: user.id, email: user.email, slug })
    redirect('/dashboard')
}

export async function logout() {
    const session = await verifySession()
    if (session) logEvent('LOGOUT', { userId: session.userId })
    await deleteSession()
    redirect('/login')
}

export async function createAppointment(formData: FormData) {
    const session = await verifySession()
    if (!session || !session.userId) {
        logEvent('ACCESS_DENIED', { attempt: 'createAppointment', reason: 'Unauthorized' })
        return { error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        include: { subscription: true }
    })

    if (user?.subscription) {
        const plan = getPlanLimit(user.subscription.status, (user.subscription as any).planId)
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const count = await prisma.appointment.count({
            where: { userId: session.userId, createdAt: { gte: startOfMonth } }
        })

        if (count >= plan.maxAppointmentsPerMonth) {
            return { error: `Seu plano (${plan.name}) atingiu o limite de ${plan.maxAppointmentsPerMonth} agendamentos este mês. Faça o upgrade para continuar.` }
        }
    }

    const date = formData.get('date') as string
    const startTime = formData.get('startTime') as string
    const endTime = formData.get('endTime') as string
    const clientName = formData.get('clientName') as string

    if (!date || !startTime || !endTime || !clientName) return { error: 'All fields are required' }

    const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
    const startMins = toMins(startTime)
    const endMins = toMins(endTime)
    if (startMins >= endMins) return { error: 'End time must be after start time' }

    const targetDate = new Date(date + 'T00:00:00.000Z')
    const existing = await prisma.appointment.findMany({
        where: { userId: session.userId as string, date: targetDate, status: 'SCHEDULED' }
    })

    if (existing.some(a => startMins < toMins(a.endTime) && toMins(a.startTime) < endMins)) {
        return { error: 'Time not available' }
    }

    const appt = await prisma.appointment.create({
        data: {
            userId: session.userId as string,
            date: targetDate,
            startTime,
            endTime,
            clientName,
            clientEmail: (session as any).email || 'internal@schedlyfy.com',
            reminder24hSent: false,
            reminder1hSent: false
        }
    })

    // notify user (push) — best-effort
    try { const { notifyUserById } = await import('./push'); await notifyUserById(session.userId as string, { title: 'Novo agendamento', body: `${clientName} — ${startTime}`, data: { url: '/dashboard' } }) } catch (e) { /* ignore */ }

    logEvent('APPOINTMENT_CREATED', { userId: session.userId, appointmentId: appt.id, client: clientName, date })
    revalidatePath('/schedule')
    revalidatePath('/calendar')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function bookAppointmentPublic(formData: FormData) {
    const providerId = formData.get('providerId') as string
    const eventTypeId = formData.get('eventTypeId') as string
    const date = formData.get('date') as string
    const startTime = formData.get('startTime') as string
    const endTime = formData.get('endTime') as string
    const clientName = formData.get('clientName') as string
    const clientEmail = formData.get('clientEmail') as string
    const clientPhone = formData.get('clientPhone') as string
    const notes = formData.get('notes') as string
    const rescheduleToken = formData.get('rescheduleToken') as string

    if (!providerId || !date || !startTime || !endTime || !clientName || !clientEmail) {
        return { error: 'Campos obrigatórios ausentes' }
    }

    const provider = await prisma.user.findUnique({
        where: { id: providerId },
        include: { subscription: true }
    })
    const eventType = await prisma.eventType.findUnique({ where: { id: eventTypeId } })
    if (!provider || !eventType) return { error: 'Prestador ou serviço não encontrado' }

    if (provider.subscription) {
        const plan = getPlanLimit(provider.subscription.status, (provider.subscription as any).planId)
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const count = await prisma.appointment.count({
            where: { userId: provider.id, createdAt: { gte: startOfMonth } }
        })

        if (count >= plan.maxAppointmentsPerMonth) {
            return { error: `Este profissional atingiu o limite de agendamentos para o plano atual.` }
        }
    }

    const targetDate = new Date(date + 'T00:00:00.000Z')

    // Final double-check for availability
    const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
    const startMins = toMins(startTime)
    const endMins = toMins(endTime)

    const existing = await prisma.appointment.findMany({
        where: { userId: providerId, date: targetDate, status: 'SCHEDULED' }
    })

    if (existing.some(a => startMins < toMins(a.endTime) && toMins(a.startTime) < endMins)) {
        return { error: 'Este horário acabou de ser ocupado. Por favor, escolha outro.' }
    }

    const appt = await prisma.appointment.create({
        data: {
            userId: providerId,
            eventTypeId,
            date: targetDate,
            startTime,
            endTime,
            clientName,
            clientEmail,
            clientPhone,
            notes,
            reminder24hSent: false,
            reminder1hSent: false
        }
    })

    if (rescheduleToken) {
        await prisma.appointment.update({
            where: { cancelToken: rescheduleToken },
            data: { status: 'RESCHEDULED' }
        })
    }

    // Notify provider (push)
    try {
        const { notifyUserById } = await import('./push');
        await notifyUserById(providerId, {
            title: 'Novo agendamento!',
            body: `${clientName} agendou ${eventType.name} para às ${startTime}`,
            data: { url: '/dashboard' }
        })
    } catch (e) { /* ignore */ }

    // Send confirmation email
    try {
        const { sendAppointmentConfirmationEmail } = await import('./email-resend');
        await sendAppointmentConfirmationEmail(
            clientEmail,
            clientName,
            provider.name || 'Prestador',
            eventType.name,
            date,
            startTime,
            appt.cancelToken
        );
    } catch (e) { /* ignore */ }

    logEvent('PUBLIC_BOOKING_V2', { providerId, eventTypeId, client: clientName, date, time: startTime })
    revalidatePath('/dashboard')
    revalidatePath('/calendar')
    return { success: true }
}

export async function cancelAppointment(appointmentId: string) {
    const session = await verifySession()
    if (!session || !session.userId) {
        logEvent('ACCESS_DENIED', { attempt: 'cancelAppointment', reason: 'Unauthorized' })
        return { error: 'Unauthorized' }
    }

    const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } })
    if (!appt || appt.userId !== session.userId) {
        logEvent('ACCESS_DENIED', { attempt: 'cancelAppointment', reason: 'Forbidden - Ownership', apptId: appointmentId })
        return { error: 'Unauthorized' }
    }

    await prisma.appointment.update({ where: { id: appointmentId }, data: { status: 'CANCELED' } })
    logEvent('APPOINTMENT_CANCELED', { userId: session.userId, appointmentId })

    revalidatePath('/schedule')
    revalidatePath('/calendar')
    revalidatePath('/dashboard')
}

export async function activateSubscription(targetUserId: string) {
    const session = await verifySession()
    if (!session || !session.userId) return { error: 'Unauthorized' }
    const admin = await prisma.user.findUnique({ where: { id: session.userId as string } })
    if (admin?.role !== 'ADMIN') {
        logEvent('ACCESS_DENIED', { attempt: 'activateSubscription', userId: session.userId })
        return { error: 'Forbidden' }
    }

    await prisma.subscription.update({
        where: { userId: targetUserId },
        data: { status: 'ACTIVE', trialEndDate: null }
    })
    logEvent('SUBSCRIPTION_STATUS_CHANGE', { targetUserId, newStatus: 'ACTIVE', adminId: session.userId })
    revalidatePath('/admin')
}

export async function expireSubscription(targetUserId: string) {
    const session = await verifySession()
    if (!session || !session.userId) return { error: 'Unauthorized' }
    const admin = await prisma.user.findUnique({ where: { id: session.userId as string } })
    if (admin?.role !== 'ADMIN') {
        logEvent('ACCESS_DENIED', { attempt: 'expireSubscription', userId: session.userId })
        return { error: 'Forbidden' }
    }

    await prisma.subscription.update({
        where: { userId: targetUserId },
        data: { status: 'EXPIRED' }
    })
    logEvent('SUBSCRIPTION_STATUS_CHANGE', { targetUserId, newStatus: 'EXPIRED', adminId: session.userId })
    revalidatePath('/admin')
}

export async function updateSettings(formData: FormData) {
    const session = await verifySession()
    if (!session || !session.userId) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const language = formData.get('language') as string || 'pt-BR'
    const avatarUrl = formData.get('avatarUrl') as string
    const phone = formData.get('phone') as string
    const bio = formData.get('bio') as string
    const website = formData.get('website') as string
    const minLeadTime = parseInt(formData.get('minLeadTime') as string) || 2
    const maxFutureDays = parseInt(formData.get('maxFutureDays') as string) || 30

    try {
        await prisma.user.update({
            where: { id: session.userId as string },
            data: {
                name,
                language,
                slug: slug?.toLowerCase()?.trim()?.replace(/[^a-z0-9]+/g, '-') || null,
                avatarUrl: avatarUrl || null,
                phone: phone || null,
                bio: bio || null,
                website: website || null,
                minLeadTime,
                maxFutureDays
            }
        })
    } catch (e) {
        return { error: 'Este link já está em uso por outro usuário.' }
    }

    const cookieStore = await cookies()
    const localeCode = language === 'pt-BR' ? 'pt' : 'en'
    cookieStore.set('NEXT_LOCALE', localeCode, { path: '/' })

    logEvent('SETTINGS_UPDATED', { userId: session.userId, language, slug })
    revalidatePath('/settings')
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard', 'layout')
    return { success: true }
}

export async function createEventType(formData: FormData) {
    const session = await verifySession()
    if (!session || !session.userId) return { error: 'Unauthorized' }

    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        include: { subscription: true, _count: { select: { eventTypes: true } } }
    })

    if (user?.subscription) {
        const plan = getPlanLimit(user.subscription.status, (user.subscription as any).planId)
        if (!plan.multipleEventTypes && user._count.eventTypes >= 1) {
            return { error: `Seu plano (${plan.name}) permite apenas 1 tipo de serviço. Faça o upgrade para criar mais.` }
        }
    }

    const name = formData.get('name') as string
    const duration = parseInt(formData.get('duration') as string)
    const description = formData.get('description') as string
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null
    const bufferTime = parseInt(formData.get('bufferTime') as string) || 0
    const color = formData.get('color') as string || '#3b82f6'

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    try {
        await prisma.eventType.create({
            data: {
                userId: session.userId as string,
                name,
                slug,
                description,
                duration,
                price: price as any,
                bufferTime,
                color,
            }
        })
        revalidatePath('/settings/event-types')
        return { success: true }
    } catch (e) {
        return { error: 'Um serviço com este nome já existe.' }
    }
}

export async function updateAvailability(availability: { dayOfWeek: number, startTime: string, endTime: string }[]) {
    const session = await verifySession()
    if (!session || !session.userId) return { error: 'Unauthorized' }

    await prisma.$transaction([
        prisma.availability.deleteMany({ where: { userId: session.userId as string } }),
        prisma.availability.createMany({
            data: availability.map(a => ({
                userId: session.userId as string,
                dayOfWeek: a.dayOfWeek,
                startTime: a.startTime,
                endTime: a.endTime
            }))
        })
    ])

    revalidatePath('/settings/availability')
    return { success: true }
}

export async function updateEventType(formData: FormData) {
    const session = await verifySession()
    if (!session || !session.userId) return { error: 'Unauthorized' }

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const duration = parseInt(formData.get('duration') as string)
    const description = formData.get('description') as string
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null
    const bufferTime = parseInt(formData.get('bufferTime') as string) || 0
    const color = formData.get('color') as string || '#3b82f6'
    const isActive = formData.get('isActive') === 'true'

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    try {
        await prisma.eventType.update({
            where: { id, userId: session.userId as string },
            data: {
                name,
                slug,
                description,
                duration,
                price: price as any,
                bufferTime,
                color,
                isActive
            }
        })
        revalidatePath('/settings/event-types')
        return { success: true }
    } catch (e) {
        return { error: 'Erro ao atualizar o serviço.' }
    }
}

export async function deleteEventType(id: string) {
    const session = await verifySession()
    if (!session || !session.userId) return { error: 'Unauthorized' }

    try {
        await prisma.eventType.delete({
            where: { id, userId: session.userId as string }
        })
        revalidatePath('/settings/event-types')
        return { success: true }
    } catch (e) {
        return { error: 'Erro ao excluir o serviço. Verifique se existem agendamentos vinculados.' }
    }
}

export async function cancelAppointmentForm(formData: FormData) {
    const token = formData.get('token') as string
    if (!token) return { error: 'Token missing' }
    return cancelAppointmentPublic(token)
}

export async function cancelAppointmentPublic(token: string) {
    await prisma.appointment.update({
        where: { cancelToken: token },
        data: { status: 'CANCELED' }
    })

    revalidatePath(`/appointment/${token}`)
    return { success: true }
}
