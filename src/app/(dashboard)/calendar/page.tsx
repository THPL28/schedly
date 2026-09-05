import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CalendarView from '@/app/(dashboard)/calendar/calendar-view'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string, year?: string, date?: string }> }) {
    const session = await verifySession()
    if (!session) redirect('/login')

    const resolvedSearchParams = await searchParams
    const now = new Date()
    const year = Number(resolvedSearchParams.year) || now.getFullYear()
    const month = resolvedSearchParams.month !== undefined ? Number(resolvedSearchParams.month) : now.getMonth()
    const selectedDate = resolvedSearchParams.date || now.toISOString().split('T')[0]
    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59)

    const monthAppointments = await prisma.appointment.findMany({
        where: { userId: session.userId as string, date: { gte: startOfMonth, lte: endOfMonth }, status: 'SCHEDULED' },
        select: { date: true }
    })
    const counts: Record<string, number> = {}
    monthAppointments.forEach(a => { const d = a.date.toISOString().split('T')[0]; counts[d] = (counts[d] || 0) + 1 })

    const targetDateStart = new Date(selectedDate + 'T00:00:00.000Z')
    const targetDateEnd = new Date(selectedDate + 'T23:59:59.999Z')
    const appointmentsToday = await prisma.appointment.findMany({
        where: { userId: session.userId as string, date: { gte: targetDateStart, lte: targetDateEnd }, status: 'SCHEDULED' },
        orderBy: { startTime: 'asc' }
    })

    return (
        <div className="page-shell !max-w-none !pt-5 !pb-8">
            <CalendarView
                year={year}
                month={month}
                counts={counts}
                appointmentsToday={appointmentsToday.map(a => ({ ...a, date: a.date.toISOString(), createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString() }))}
                selectedDate={selectedDate}
            />
        </div>
    )
}
