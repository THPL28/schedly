import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
    Clock,
    Users,
    CalendarCheck,
    Plus,
    Filter
} from 'lucide-react'
import Link from 'next/link'
import Timeline from '../schedule/timeline'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ date?: string, status?: string }> }) {
    const session = await verifySession()
    if (!session) redirect('/login')

    const resolvedParams = await searchParams
    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        include: { subscription: true }
    })

    if (!user) {
        redirect('/login')
    }

    const dateStr = resolvedParams.date || new Date().toISOString().split('T')[0]
    const status = resolvedParams.status || 'SCHEDULED'
    const targetDate = new Date(dateStr + 'T00:00:00.000Z')
    const targetEnd = new Date(dateStr + 'T23:59:59.999Z')

    const [todayAppts, totalCount, uniqueClients] = await prisma.$transaction([
        prisma.appointment.findMany({
            where: {
                userId: session.userId as string,
                date: { gte: targetDate, lte: targetEnd },
                status: status as any
            },
            include: {
                eventType: true
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

    const serializedAppts = todayAppts.map(app => ({
        ...app,
        date: app.date.toISOString(),
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        eventType: app.eventType ? {
            ...app.eventType,
            price: app.eventType.price ? Number(app.eventType.price) : null,
            createdAt: app.eventType.createdAt.toISOString(),
            updatedAt: app.eventType.updatedAt.toISOString(),
        } : null
    }));

    const kpis = [
        { label: isToday ? 'Hoje' : 'Neste Dia', value: todayAppts.length, icon: Clock, color: 'var(--primary)', bg: 'rgba(99, 102, 241, 0.1)' },
        { label: 'Total Ativos', value: totalCount, icon: CalendarCheck, color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
        { label: 'Clientes únicos', value: uniqueClients.length, icon: Users, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    ]

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-foreground">
                        Olá, {user?.name?.split(' ')[0]}!
                    </h2>
                    <p className="text-muted mt-1 text-sm sm:text-base font-medium">
                        {isToday ? 'Estes são seus compromissos para hoje.' : `Visualizando agenda para ${new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { dateStyle: 'long' })}`}
                    </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <Link
                        href={`?date=${dateStr}&status=SCHEDULED`}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${status === 'SCHEDULED' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-muted border-border hover:border-primary/30'}`}
                    >
                        Confirmados
                    </Link>
                    <Link
                        href={`?date=${dateStr}&status=CANCELED`}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${status === 'CANCELED' ? 'bg-danger text-white border-danger shadow-lg shadow-danger/20' : 'bg-white text-muted border-border hover:border-danger/30'}`}
                    >
                        Cancelados
                    </Link>
                </div>
            </div>

            {/* Simple KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {kpis.map((kpi, i) => (
                    <div key={i} className="card p-6 flex items-center gap-4 hover:translate-y-[-2px] transition-transform shadow-sm">
                        <div
                            className="flex items-center justify-center rounded-2xl flex-shrink-0"
                            style={{ width: 48, height: 48, background: kpi.bg, color: kpi.color }}
                        >
                            <kpi.icon size={24} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs font-black text-muted mb-0 uppercase tracking-widest">{kpi.label}</p>
                            <p className="text-xl sm:text-2xl font-black text-foreground mb-0">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Daily Timeline */}
            <div className="card p-4 sm:p-8 shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black">Agenda do Período</h3>
                        <span className="text-[10px] bg-muted-light text-muted px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                            {status === 'SCHEDULED' ? 'Confirmados' : 'Cancelados'}
                        </span>
                    </div>
                    <Link href="/calendar" className="text-xs font-bold py-2 px-4 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-colors" style={{ textDecoration: 'none' }}>Ver Calendário Completo</Link>
                </div>

                <Timeline date={dateStr} appointments={serializedAppts} />
            </div>
        </div>
    )
}
