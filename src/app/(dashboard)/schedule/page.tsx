import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Timeline from './timeline'
import { redirect } from 'next/navigation'

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const session = await verifySession()
    if (!session) redirect('/login')

    const resolvedParams = await searchParams;
    const dateStr = resolvedParams.date || new Date().toISOString().split('T')[0]

    // Use start of day for query
    const targetDate = new Date(dateStr + 'T00:00:00.000Z')

    const appointments = await prisma.appointment.findMany({
        where: {
            userId: session.userId as string,
            date: targetDate,
            status: 'SCHEDULED'
        },
        orderBy: {
            startTime: 'asc'
        }
    })

    return (
        <Timeline date={dateStr} appointments={appointments} />
    )

}
