'use server'

import { prisma } from './prisma'
import { createSession, verifyPassword, hashPassword, deleteSession, verifySession } from './auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

// Logger helper
function logEvent(event: string, details: any) {
    const timestamp = new Date().toISOString()
    console.log(`[LOG] ${timestamp} | EVENT: ${event} | DETAILS: ${JSON.stringify(details)}`)
}

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) return { error: 'Email and password are required' }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
        logEvent('LOGIN_FAILED', { email, reason: 'Invalid credentials' })
        return { error: 'Invalid credentials' }
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
        data: { userId: session.userId as string, date: targetDate, startTime, endTime, clientName, reminderMinutesBefore: 60 }
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
    const date = formData.get('date') as string
    const startTime = formData.get('startTime') as string
    const endTime = formData.get('endTime') as string
    const clientName = formData.get('clientName') as string

    if (!providerId || !date || !startTime || !endTime || !clientName) return { error: 'Todos os campos são obrigatórios' }

    const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
    const startMins = toMins(startTime)
    const endMins = toMins(endTime)
    if (startMins >= endMins) return { error: 'O horário de término deve ser após o de início' }

    const targetDate = new Date(date + 'T00:00:00.000Z')
    const existing = await prisma.appointment.findMany({
        where: { userId: providerId, date: targetDate, status: 'SCHEDULED' }
    })

    if (existing.some(a => startMins < toMins(a.endTime) && toMins(a.startTime) < endMins)) {
        return { error: 'Este horário já está ocupado. Por favor, escolha outro.' }
    }

    const appt = await prisma.appointment.create({
        data: { userId: providerId, date: targetDate, startTime, endTime, clientName, reminderMinutesBefore: 60 }
    })

    // notify provider (push) — best-effort
    try { const { notifyUserById } = await import('./push'); await notifyUserById(providerId, { title: 'Novo agendamento público', body: `${clientName} — ${startTime}`, data: { url: '/dashboard' } }) } catch (e) { /* ignore */ }

    logEvent('PUBLIC_BOOKING', { providerId, client: clientName, date, time: startTime })
    revalidatePath('/schedule')
    revalidatePath('/calendar')
    revalidatePath('/dashboard')
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
                website: website || null
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
