import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Timeline from '@/app/(dashboard)/schedule/timeline'
import { redirect } from 'next/navigation'

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const session = await verifySession()
    if (!session || typeof session.userId !== 'string') redirect('/login')

    const resolvedParams = await searchParams
    const dateStr = /^\d{4}-\d{2}-\d{2}$/.test(resolvedParams.date || '') ? resolvedParams.date! : new Date().toISOString().split('T')[0]
    const targetDate = new Date(dateStr + 'T00:00:00.000Z')

    const [appointments, user] = await prisma.$transaction([
        prisma.appointment.findMany({
            where: { userId: session.userId, date: targetDate, status: 'SCHEDULED' },
            orderBy: { startTime: 'asc' },
            select: { id: true, clientId: true, clientName: true, clientPhone: true, startTime: true, endTime: true, eventType: { select: { name: true } } },
        }),
        prisma.user.findUnique({ where: { id: session.userId }, select: { vertical: true } }),
    ])

    return <Timeline date={dateStr} appointments={appointments} isMedical={user?.vertical === 'MEDICAL'} />
}
