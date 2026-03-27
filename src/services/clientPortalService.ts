import { prisma } from '@/lib/prisma'
import { EMAIL_PALETTE, renderEmailLayout, renderEmailPanel } from '@/lib/email-theme'
import { sendResendEmail } from '@/lib/resend'
import jwt from 'jsonwebtoken'
import { isAfter, isBefore, subHours } from 'date-fns'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export class ClientPortalService {
  /**
   * Request a magic link for a client
   */
  static async requestMagicLink(email: string, providerSlug: string) {
    const provider = await prisma.user.findUnique({
      where: { slug: providerSlug },
    })

    if (!provider) throw new Error('Provider not found')

    const client = await prisma.client.findUnique({
      where: { email },
    })

    // We only allow portal access if the client has existing appointments with this provider
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        userId: provider.id,
        clientEmail: email,
      },
    })

    if (!existingAppointment) {
      throw new Error('No appointments found for this email with this provider')
    }

    const token = jwt.sign(
      {
        clientId: client?.id,
        email,
        providerId: provider.id,
        providerSlug,
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    )

    const magicLink = `${APP_URL}/portal/${providerSlug}/auth?token=${token}`

    await sendResendEmail({
      to: email,
      subject: 'Seu acesso ao Portal do Cliente',
      html: renderEmailLayout({
        eyebrow: 'Portal do Cliente',
        title: 'Seu acesso está pronto',
        description: `Use o link abaixo para consultar seus agendamentos com ${provider.name}.`,
        contentHtml: renderEmailPanel(
          `
            <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.7; color: ${EMAIL_PALETTE.foreground};">
              Este acesso foi solicitado para o e-mail <strong>${email}</strong> e expira em 15 minutos.
            </p>
            <p style="margin: 0; font-size: 14px; line-height: 1.7; color: ${EMAIL_PALETTE.muted};">
              Se você não reconhece esta solicitação, basta ignorar esta mensagem.
            </p>
          `,
          'primary'
        ),
        primaryAction: {
          label: 'Acessar portal',
          url: magicLink,
        },
        footerHtml:
          'Você recebeu este e-mail porque solicitou acesso ao <strong>Portal do Cliente</strong> no Schedly.',
      }),
    })

    return { success: true }
  }

  /**
   * Verify token
   */
  static verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as {
        clientId: string
        email: string
        providerId: string
        providerSlug: string
      }
    } catch (e) {
      throw new Error('Invalid or expired token')
    }
  }

  /**
   * Get client appointments separated by future and history
   */
  static async getClientAppointments(email: string, providerId: string) {
    const appointments = await prisma.appointment.findMany({
      where: {
        clientEmail: email,
        userId: providerId,
      },
      include: {
        eventType: true,
        cancellation: true,
      },
      orderBy: { date: 'desc' },
    })

    const now = new Date()

    const future = appointments.filter(
      appointment =>
        appointment.status === 'SCHEDULED' &&
        (isAfter(new Date(appointment.date), now) ||
          new Date(appointment.date).toDateString() === now.toDateString())
    )

    const history = appointments.filter(
      appointment =>
        appointment.status !== 'SCHEDULED' ||
        (isBefore(new Date(appointment.date), now) &&
          new Date(appointment.date).toDateString() !== now.toDateString())
    )

    return { future, history }
  }

  /**
   * Cancel appointment with reason
   */
  static async cancelAppointment(params: {
    appointmentId: string
    cancelledBy: 'CLIENT' | 'PROVIDER'
    reasonType: string
    reasonText?: string
  }) {
    const { appointmentId, cancelledBy, reasonType, reasonText } = params

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { user: true },
    })

    if (!appointment) throw new Error('Appointment not found')

    // Policy check: cannot cancel less than the provider lead time before the appointment.
    const minLeadTime = appointment.user.minLeadTime || 2
    const cancelLimit = subHours(
      new Date(`${appointment.date.toISOString().split('T')[0]}T${appointment.startTime}`),
      minLeadTime
    )

    const now = new Date()
    const isLateForClient = isAfter(now, cancelLimit)

    if (cancelledBy === 'CLIENT' && isLateForClient) {
      throw new Error(`Cancelamento permitido apenas até ${minLeadTime}h antes do horário.`)
    }

    return prisma.$transaction([
      prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'CANCELED' },
      }),
      prisma.appointmentCancellation.create({
        data: {
          appointmentId,
          cancelledBy,
          reasonType,
          reasonText,
        },
      }),
    ])
  }
}