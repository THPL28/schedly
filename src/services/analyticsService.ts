import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, isBefore, isAfter } from 'date-fns';

export class AnalyticsService {
    /**
     * Get basic metrics for a provider
     */
    static async getProviderMetrics(userId: string) {
        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);

        const appointments = await prisma.appointment.findMany({
            where: { userId },
            include: {
                cancellation: true,
            }
        });

        const total = appointments.length;
        const completed = appointments.filter(a => a.status === 'COMPLETED' || (a.status === 'SCHEDULED' && isBefore(new Date(a.date), now))).length;
        const cancelled = appointments.filter(a => a.status === 'CANCELED').length;
        const scheduled = appointments.filter(a => a.status === 'SCHEDULED' && isAfter(new Date(a.date), now)).length;

        // Attendance Rate: Completed / (Completed + No-Show)
        // For simplicity, we assume SCHEDULED in the past with attended=false are no-shows
        const attended = appointments.filter(a => a.attended).length;
        const attendanceRate = total > 0 ? (attended / (total - scheduled - cancelled)) * 100 : 0;

        const cancelRate = total > 0 ? (cancelled / total) * 100 : 0;

        // Estimated Revenue (Completed items with a price)
        // We need to fetch event types prices if not stored in appointment
        const revenueAppointments = await prisma.appointment.findMany({
            where: {
                userId,
                OR: [
                    { status: 'COMPLETED' },
                    { attended: true }
                ]
            },
            include: {
                eventType: true
            }
        });

        const totalRevenue = revenueAppointments.reduce((acc, app) => {
            return acc + (Number(app.eventType?.price) || 0);
        }, 0);

        return {
            total,
            attendanceRate: Math.round(attendanceRate),
            cancelRate: Math.round(cancelRate),
            totalRevenue,
            scheduled
        };
    }

    /**
     * Get cancellation distribution
     */
    static async getCancellationAnalytics(userId: string) {
        const cancellations = await prisma.appointmentCancellation.findMany({
            where: {
                appointment: {
                    userId
                }
            }
        });

        const distribution = {
            desistiu: 0,
            reagendamento: 0,
            financeiro: 0,
            outros: 0
        };

        cancellations.forEach(c => {
            const type = c.reasonType?.toLowerCase() as keyof typeof distribution;
            if (distribution[type] !== undefined) {
                distribution[type]++;
            } else {
                distribution.outros++;
            }
        });

        const total = cancellations.length;
        const percentages = Object.entries(distribution).map(([key, value]) => ({
            type: key,
            count: value,
            percentage: total > 0 ? Math.round((value / total) * 100) : 0
        }));

        return {
            total,
            distribution: percentages
        };
    }

    /**
     * Get most recurring clients
     */
    static async getTopClients(userId: string, limit = 5) {
        const clients = await prisma.client.findMany({
            where: {
                appointments: {
                    some: { userId }
                }
            },
            include: {
                _count: {
                    select: { appointments: { where: { userId } } }
                }
            },
            orderBy: {
                appointments: {
                    _count: 'desc'
                }
            },
            take: limit
        });

        return clients.map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            appointmentCount: c._count.appointments
        }));
    }
}
