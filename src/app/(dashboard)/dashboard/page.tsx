import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Clock, Users, CalendarCheck, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import DashboardViewSwitcher from '@/app/(dashboard)/dashboard/dashboard-view-switcher'

const VALID_STATUSES = ['SCHEDULED', 'CANCELED'] as const
type AppointmentStatus = typeof VALID_STATUSES[number]

function getTodayDateString() {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date())
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ date?: string, status?: string }> }) {
    const session = await verifySession()
    if (!session || typeof session.userId !== 'string') redirect('/login')

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            subscription: true,
            _count: { select: { availability: true, eventTypes: true } }
        }
    })

    if (!user) redirect('/login')

    const todayDateStr = getTodayDateString()
    const resolvedParams = await searchParams
    const requestedDate = resolvedParams.date || todayDateStr
    const dateStr = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : todayDateStr
    const status: AppointmentStatus = VALID_STATUSES.includes(resolvedParams.status as AppointmentStatus)
        ? resolvedParams.status as AppointmentStatus
        : 'SCHEDULED'

    const targetDate = new Date(`${dateStr}T00:00:00.000Z`)
    const targetEnd = new Date(`${dateStr}T23:59:59.999Z`)

    const [todayAppts, totalCount, uniqueClients] = await prisma.$transaction([
        prisma.appointment.findMany({
            where: { userId: session.userId, date: { gte: targetDate, lte: targetEnd }, status },
            include: { eventType: true },
            orderBy: { startTime: 'asc' }
        }),
        prisma.appointment.count({ where: { userId: session.userId, status: 'SCHEDULED' } }),
        prisma.appointment.findMany({ where: { userId: session.userId }, select: { clientName: true }, distinct: ['clientName'] }),
    ])

    const isToday = dateStr === todayDateStr
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
    }))

    const kpis = [
        { label: isToday ? 'Hoje' : 'No dia', value: todayAppts.length, icon: Clock, tone: 'primary', helper: 'agendamentos' },
        { label: 'Confirmados', value: totalCount, icon: CalendarCheck, tone: 'success', helper: 'na sua agenda' },
        { label: 'Clientes', value: uniqueClients.length, icon: Users, tone: 'secondary', helper: 'cadastrados' },
    ]

    const geminiInsight = isToday ? await (async () => {
        try {
            const { getDashboardInsight } = await import('@/lib/gemini')
            return await getDashboardInsight(user.name || 'Profissional', todayAppts)
        } catch {
            return null
        }
    })() : null

    const firstName = user.name?.split(' ')[0] || 'Profissional'

    return (
        <div className="dashboard-page">
            {user._count.availability === 0 && (
                <section className="dashboard-setup-banner">
                    <div className="dashboard-setup-icon"><Clock size={21} /></div>
                    <div className="dashboard-setup-copy">
                        <strong>Configure sua disponibilidade</strong>
                        <span>Defina seus horários para que seus clientes possam agendar.</span>
                    </div>
                    <Link href="/settings/availability" className="dashboard-setup-action">
                        Configurar <ArrowRight size={15} />
                    </Link>
                </section>
            )}

            <header className="dashboard-page-header">
                <div>
                    <p className="dashboard-eyebrow">{isToday ? 'Visão geral' : 'Agenda selecionada'}</p>
                    <h1>Olá, {firstName}!</h1>
                    <p className="dashboard-subtitle">
                        {isToday
                            ? 'Aqui está o que está acontecendo na sua agenda hoje.'
                            : `Visualizando ${new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('pt-BR', { dateStyle: 'long', timeZone: 'America/Sao_Paulo' })}.`}
                    </p>
                </div>
                <div className="dashboard-status-toggle">
                    <Link href={`?date=${dateStr}&status=SCHEDULED`} className={status === 'SCHEDULED' ? 'is-active' : ''}>Confirmados</Link>
                    <Link href={`?date=${dateStr}&status=CANCELED`} className={status === 'CANCELED' ? 'is-active' : ''}>Cancelados</Link>
                </div>
            </header>

            <section className="dashboard-kpi-grid" aria-label="Resumo da agenda">
                {kpis.map((kpi) => (
                    <article key={kpi.label} className="dashboard-kpi-card">
                        <div className={`dashboard-kpi-icon ${kpi.tone}`}><kpi.icon size={19} /></div>
                        <div className="dashboard-kpi-content">
                            <span>{kpi.label}</span>
                            <strong>{kpi.value}</strong>
                            <small>{kpi.helper}</small>
                        </div>
                    </article>
                ))}
            </section>

            {geminiInsight && (
                <section className="dashboard-insight">
                    <div className="dashboard-insight-icon"><Sparkles size={18} /></div>
                    <div>
                        <div className="dashboard-insight-label">Insight do Schedly</div>
                        <p>{geminiInsight.trim()}</p>
                    </div>
                </section>
            )}

            <DashboardViewSwitcher
                user={user}
                dateStr={dateStr}
                status={status}
                serializedAppts={serializedAppts}
                isToday={isToday}
            />
        </div>
    )
}
