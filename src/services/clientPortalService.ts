import { prisma } from '@/lib/prisma'
import { EMAIL_PALETTE, renderEmailLayout, renderEmailPanel } from '@/lib/email-theme'
import { sendResendEmail } from '@/lib/resend'
import jwt from 'jsonwebtoken'
import { isAfter, isBefore, subHours } from 'date-fns'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV !== 'production') return 'dev-only-schedly-secret'
  throw new Error('JWT_SECRET is required in production')
}

const JWT_ALGORITHM = 'HS256' as const

export class ClientPortalService {
  static async requestMagicLink(email: string, providerSlug: string) {
    const provider = await prisma.user.findUnique({ where: { slug: providerSlug } })
    if (!provider) throw new Error('Provider not found')

    const normalizedEmail = email.trim().toLowerCase()
    const existingAppointment = await prisma.appointment.findFirst({
      where: { userId: provider.id, clientEmail: normalizedEmail },
    })

    if (!existingAppointment) {
      throw new Error('No appointments found for this email with this provider')
    }

    const client = await prisma.client.findFirst({
      where: {
        email: normalizedEmail,
        appointments: { some: { userId: provider.id } },
      },
      select: { id: true },
    })

    const token = jwt.sign(
      {
        ...(client?.id ? { clientId: client.id } : {}),
        email: normalizedEmail,
        providerId: provider.id,
        providerSlug,
      },
      getJwtSecret(),
      { expiresIn: '15m', algorithm: JWT_ALGORITHM }
    )

    const magicLink = `${APP_URL}/portal/${providerSlug}/auth?token=${encodeURIComponent(token)}`

    await sendResendEmail({
      to: normalizedEmail,
      subject: 'Seu acesso ao Portal do Cliente',
      html: renderEmailLayout({
        eyebrow: 'Portal do Cliente',
        title: 'Seu acesso está pronto',
        description: `Use o link abaixo para consultar seus agendamentos com ${provider.name}.`,
        contentHtml: renderEmailPanel(
          `<p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.7; color: ${EMAIL_PALETTE.foreground};">Este acesso foi solicitado para o e-mail <strong>${normalizedEmail}</strong> e expira em 15 minutos.</p><p style="margin: 0; font-size: 14px; line-height: 1.7; color: ${EMAIL_PALETTE.muted};">Se você não reconhece esta solicitação, basta ignorar esta mensagem.</p>`,
          'primary'
        ),
        primaryAction: { label: 'Acessar portal', url: magicLink },
        footerHtml: 'Você recebeu este e-mail porque solicitou acesso ao <strong>Portal do Cliente</strong> no Schedly.',
      }),
    })

    return { success: true }
  }

  static verifyToken(token: string) {
    try {
      const payload = jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] })
      if (!payload || typeof payload !== 'object') throw new Error('Invalid token')
      if (typeof payload.email !== 'string' || !payload.email) throw new Error('Invalid token')
      if (typeof payload.providerId !== 'string' || !payload.providerId) throw new Error('Invalid token')
      if (typeof payload.providerSlug !== 'string' || !payload.providerSlug) throw new Error('Invalid token')
      return {
        clientId: typeof payload.clientId === 'string' ? payload.clientId : undefined,
        email: payload.email,
        providerId: payload.providerId,
        providerSlug: payload.providerSlug,
      }
    } catch {
      throw new Error('Invalid or expired token')
    }
  }

  static async getClientAppointments(email: string, providerId: string) {
    const normalizedEmail = email.trim().toLowerCase()
    const appointments = await prisma.appointment.findMany({
      where: { clientEmail: normalizedEmail, userId: providerId },
      include: { eventType: true, cancellation: true },
      orderBy: { date: 'desc' },
    })

    const now = new Date()
    const future = appointments.filter(
      appointment => appointment.status === 'SCHEDULED' &&
        (isAfter(new Date(appointment.date), now) || new Date(appointment.date).toDateString() === now.toDateString())
    )
    const history = appointments.filter(
      appointment => appointment.status !== 'SCHEDULED' ||
        (isBefore(new Date(appointment.date), now) && new Date(appointment.date).toDateString() !== now.toDateString())
    )

    return { future, history }
  }

  static async cancelAppointment(params: {
    appointmentId: string
    cancelledBy: 'CLIENT' | 'PROVIDER'
    reasonType: string
    reasonText?: string
  }) {
    const { appointmentId, cancelledBy, reasonType, reasonText } = params
    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId }, include: { user: true } })
    if (!appointment) throw new Error('Appointment not found')

    const minLeadTime = appointment.user.minLeadTime || 2
    const cancelLimit = subHours(new Date(`${appointment.date.toISOString().split('T')[0]}T${appointment.startTime}`), minLeadTime)
    if (cancelledBy === 'CLIENT' && isAfter(new Date(), cancelLimit)) {
      throw new Error(`Cancelamento permitido apenas até ${minLeadTime}h antes do horário.`)
    }

    return prisma.$transaction(async tx => {
      const current = await tx.appointment.findUnique({ where: { id: appointmentId }, select: { status: true } })
      if (!current || current.status !== 'SCHEDULED') throw new Error('Agendamento já cancelado ou indisponível')

      const updated = await tx.appointment.update({ where: { id: appointmentId }, data: { status: 'CANCELED' } })
      await tx.appointmentCancellation.create({ data: { appointmentId, cancelledBy, reasonType, reasonText } })
      return updated
    })
  }
}
