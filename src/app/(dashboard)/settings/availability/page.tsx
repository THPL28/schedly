import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import AvailabilityForm from './availability-form';

export default async function AvailabilityPage() {
    const session = await verifySession();
    if (!session || !session.userId) return null;

    const availability = await prisma.availability.findMany({
        where: { userId: session.userId as string },
        orderBy: { dayOfWeek: 'asc' },
    });

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Disponibilidade</h1>
            <p className="text-muted mb-10">Defina os horários em que você está disponível para agendamentos semanais.</p>

            <AvailabilityForm initialAvailability={availability} />
        </div>
    );
}
