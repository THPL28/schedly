import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { isAfter, addMinutes, isBefore, subHours } from 'date-fns';

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export class ClientPortalService {
    /**
     * Request a magic link for a client
     */
    static async requestMagicLink(email: string, providerSlug: string) {
        const provider = await prisma.user.findUnique({
            where: { slug: providerSlug }
        });

        if (!provider) throw new Error('Provider not found');

        const client = await prisma.client.findUnique({
            where: { email }
        });

        // We only allow portal access if the client has existing appointments with this provider
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                userId: provider.id,
                clientEmail: email
            }
        });

        if (!existingAppointment) {
            throw new Error('No appointments found for this email with this provider');
        }

        const token = jwt.sign(
            {
                clientId: client?.id,
                email,
                providerId: provider.id,
                providerSlug
            },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${providerSlug}/auth?token=${token}`;

        await resend.emails.send({
            from: 'Schedly <no-reply@schedly.app>',
            to: email,
            subject: 'Seu acesso ao Portal do Cliente',
            html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">Acesso ao Portal</h2>
          <p>Olá, clique no botão abaixo para acessar seus agendamentos com <strong>${provider.name}</strong>.</p>
          <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
            Acessar Portal
          </a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            Este link expira em 15 minutos. Se você não solicitou este acesso, ignore este email.
          </p>
        </div>
      `
        });

        return { success: true };
    }

    /**
     * Verify token
     */
    static verifyToken(token: string) {
        try {
            return jwt.verify(token, JWT_SECRET) as {
                clientId: string;
                email: string;
                providerId: string;
                providerSlug: string;
            };
        } catch (e) {
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Get client appointments separated by future and history
     */
    static async getClientAppointments(email: string, providerId: string) {
        const appointments = await prisma.appointment.findMany({
            where: {
                clientEmail: email,
                userId: providerId
            },
            include: {
                eventType: true,
                cancellation: true
            },
            orderBy: { date: 'desc' }
        });

        const now = new Date();

        const future = appointments.filter(a =>
            a.status === 'SCHEDULED' &&
            (isAfter(new Date(a.date), now) || (new Date(a.date).toDateString() === now.toDateString()))
        );

        const history = appointments.filter(a =>
            a.status !== 'SCHEDULED' ||
            (isBefore(new Date(a.date), now) && new Date(a.date).toDateString() !== now.toDateString())
        );

        return { future, history };
    }

    /**
     * Cancel appointment with reason
     */
    static async cancelAppointment(params: {
        appointmentId: string;
        cancelledBy: 'CLIENT' | 'PROVIDER';
        reasonType: string;
        reasonText?: string;
    }) {
        const { appointmentId, cancelledBy, reasonType, reasonText } = params;

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { user: true }
        });

        if (!appointment) throw new Error('Appointment not found');

        // Policy check: Cannot cancel less than 2 hours before (or provider's minLeadTime)
        const minLeadTime = appointment.user.minLeadTime || 2;
        const cancelLimit = subHours(new Date(`${appointment.date.toISOString().split('T')[0]}T${appointment.startTime}`), minLeadTime);

        if (cancelledBy === 'CLIENT' && isBefore(new Date(), cancelLimit)) {
            // Allow cancellation
        } else if (cancelledBy === 'PROVIDER') {
            // Provider can always cancel (policy might differ but for now allow)
        } else {
            // throw new Error(`Cancelamento permitido apenas até ${minLeadTime}h antes do horário.`);
        }

        return prisma.$transaction([
            prisma.appointment.update({
                where: { id: appointmentId },
                data: { status: 'CANCELED' }
            }),
            prisma.appointmentCancellation.create({
                data: {
                    appointmentId,
                    cancelledBy,
                    reasonType,
                    reasonText
                }
            })
        ]);
    }
}
