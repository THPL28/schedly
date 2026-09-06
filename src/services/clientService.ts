import { prisma } from '@/lib/prisma';

export interface ClientFilters {
    query?: string;
    page?: number;
    pageSize?: number;
}

export class ClientService {
    /**
     * List only clients owned by the authenticated provider.
     */
    static async listClients(userId: string, filters: ClientFilters = {}) {
        const { query, page = 1, pageSize = 10 } = filters;
        const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
        const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.min(Math.floor(pageSize), 100) : 10;
        const skip = (safePage - 1) * safePageSize;

        const where = {
            userId,
            ...(query ? {
                OR: [
                    { name: { contains: query.trim(), mode: 'insensitive' as const } },
                    { email: { contains: query.trim(), mode: 'insensitive' as const } }
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
                take: safePageSize,
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
                page: safePage,
                pageSize: safePageSize,
                totalPages: Math.ceil(total / safePageSize)
            }
        };
    }

    /**
     * Get full client history for a provider.
     */
    static async getClientDetails(clientId: string, userId: string) {
        return prisma.client.findFirst({
            where: { id: clientId, userId },
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
    }

    /**
     * Add a note only when both the client and note belong to the provider.
     */
    static async addNote(clientId: string, userId: string, content: string) {
        const normalizedContent = content.trim();
        if (!normalizedContent) {
            throw new Error('O conteúdo da nota é obrigatório.');
        }

        const client = await prisma.client.findFirst({
            where: { id: clientId, userId },
            select: { id: true }
        });

        if (!client) {
            throw new Error('Cliente não encontrado.');
        }

        return prisma.clientNote.create({
            data: {
                clientId: client.id,
                userId,
                content: normalizedContent
            }
        });
    }
}
