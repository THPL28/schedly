import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import EventTypesClient from './event-types-client';

export default async function EventTypesPage() {
    const session = await verifySession();
    if (!session || !session.userId) return null;

    const [eventTypes, user] = await prisma.$transaction([
        prisma.eventType.findMany({
            where: { userId: session.userId as string },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.findUnique({
            where: { id: session.userId as string },
            select: { slug: true }
        })
    ]);

    // Serialize Decimal to number for Client Component
    const serializedEventTypes = eventTypes.map(type => ({
        ...type,
        price: type.price ? Number(type.price) : null
    }));

    return <EventTypesClient initialEventTypes={serializedEventTypes} userSlug={user?.slug || 'usuario'} />;
}
