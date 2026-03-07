import { prisma } from '@/lib/prisma';

export interface ClientFilters {
    query?: string;
    page?: number;
    pageSize?: number;
}

export class ClientService {
    /**
     * List clients with pagination and search
     */
    static async listClients(userId: string, filters: ClientFilters = {}) {
        const { query, page = 1, pageSize = 10 } = filters;
        const skip = (page - 1) * pageSize;

        const where = {
            appointments: {
                some: { userId }
            },
            ...(query ? {
                OR: [
                    { name: { contains: query, mode: 'insensitive' as const } },
                    { email: { contains: query, mode: 'insensitive' as const } }
                ]
            } : {})
        };

        const [clients, total] = await Promise.all([
            prisma.client.findMany({
                where,
                include: {
                    _count: {
                        select: { appointments: { where: { userId } } }
                    },
                    appointments: {
                        where: { userId },
                        select: {
                            status: true,
                            eventType: {
                                select: { price: true }
                            }
                        }
                    }
                },
                skip,
                take: pageSize,
                orderBy: { name: 'asc' }
            }),
            prisma.client.count({ where })
        ]);

        const enrichedClients = clients.map(client => {
            const appointments = client.appointments;
            const cancelledApps = appointments.filter(a => a.status === 'CANCELED').length;
            const totalApps = appointments.length;

            const cancelRate = totalApps > 0 ? (cancelledApps / totalApps) * 100 : 0;

            const totalRevenue = appointments.reduce((acc, app) => {
                if (app.status !== 'CANCELED') {
                    return acc + (Number(app.eventType?.price) || 0);
                }
                return acc;
            }, 0);

            return {
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone,
                totalAppointments: totalApps,
                cancelRate: Math.round(cancelRate),
                totalRevenue,
                createdAt: client.createdAt
            };
        });

        return {
            clients: enrichedClients,
            pagination: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        };
    }

    /**
     * Get full client history for a provider
     */
    static async getClientDetails(clientId: string, userId: string) {
        const client = await prisma.client.findFirst({
            where: {
                id: clientId,
                appointments: {
                    some: { userId }
                }
            },
            include: {
                appointments: {
                    where: { userId },
                    include: {
                        eventType: true,
                        cancellation: true
                    },
                    orderBy: { date: 'desc' }
                },
                notes: {
                    where: { userId },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        return client;
    }

    /**
     * Manage client notes
     */
    static async addNote(clientId: string, userId: string, content: string) {
        return prisma.clientNote.create({
            data: {
                clientId,
                userId,
                content
            }
        });
    }
}
