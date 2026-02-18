import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
    Clock,
    Users,
    CalendarCheck,
    Plus
} from 'lucide-react'
import Link from 'next/link'
import Timeline from '../schedule/timeline'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const session = await verifySession()
    if (!session) redirect('/login')

    const resolvedParams = await searchParams
    const user = await prisma.user.findUnique({ where: { id: session.userId as string } })
    
    if (!user) {
        redirect('/login')
    }

    const dateStr = resolvedParams.date || new Date().toISOString().split('T')[0]
    const targetDate = new Date(dateStr + 'T00:00:00.000Z')
    const targetEnd = new Date(dateStr + 'T23:59:59.999Z')

    const [todayAppts, totalCount, uniqueClients] = await prisma.$transaction([
        prisma.appointment.findMany({
            where: {
                userId: session.userId as string,
                date: { gte: targetDate, lte: targetEnd },
                status: 'SCHEDULED'
            },
            orderBy: { startTime: 'asc' }
        }),
        prisma.appointment.count({
            where: {
                userId: session.userId as string,
                status: 'SCHEDULED'
            }
        }),
        prisma.appointment.findMany({
            where: { userId: session.userId as string },
            distinct: ['clientName'],
            select: { clientName: true }
        }),
    ])

    const isToday = dateStr === new Date().toISOString().split('T')[0]

    const kpis = [
        { label: isToday ? 'Hoje' : 'Neste Dia', value: todayAppts.length, icon: Clock, color: 'var(--primary)', bg: 'rgba(99, 102, 241, 0.1)' },
        { label: 'Total Ativos', value: totalCount, icon: CalendarCheck, color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
        { label: 'Clientes', value: uniqueClients.length, icon: Users, color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' },
    ]

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6 md:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Olá, {user?.name?.split(' ')[0]}!
                </h2>
                <p className="text-muted mt-2 text-sm sm:text-base">
                    {isToday ? 'Veja seus agendamentos para hoje.' : `Visualizando agenda para o dia ${new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                </p>
            </div>

            {/* Simple KPIs */}
            <div className="grid gap-4 sm:gap-6 mb-6 md:mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                {kpis.map((kpi, i) => (
                    <div key={i} className="card p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                        <div
                            className="flex items-center justify-center rounded-lg flex-shrink-0"
                            style={{ width: 40, height: 40, background: kpi.bg, color: kpi.color }}
                        >
                            <kpi.icon size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-muted mb-0 truncate">{kpi.label}</p>
                            <p className="text-xl sm:text-2xl font-bold text-foreground mb-0">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Daily Timeline */}
            <div className="card p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-6 md:mb-8">
                    <h3 className="text-lg sm:text-xl font-bold">Agenda do Dia</h3>
                    <Link href="/calendar" className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Ver Calendário Completo</Link>
                </div>

                <Timeline date={dateStr} appointments={todayAppts} />
            </div>
        </div>
    )
}
