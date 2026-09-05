import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Clock, Users, CalendarCheck, BriefcaseBusiness, Plus } from 'lucide-react'
import Link from 'next/link'
import DashboardViewSwitcher from '@/app/(dashboard)/dashboard/dashboard-view-switcher'

const VALID_STATUSES = ['SCHEDULED', 'CANCELED'] as const
type AppointmentStatus = typeof VALID_STATUSES[number]

function getTodayDateString() {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date())
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ date?: string, status?: string }> }) {
    const session = await verifySession()
    if (!session || typeof session.userId !== 'string') redirect('/login')

    const userId = session.userId
    const resolvedParams = await searchParams
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true, _count: { select: { availability: true, eventTypes: true } } }
    })
    if (!user) redirect('/login')

    const todayDateStr = getTodayDateString()
    const requestedDate = resolvedParams.date || todayDateStr
    const dateStr = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : todayDateStr
    const status: AppointmentStatus = VALID_STATUSES.includes(resolvedParams.status as AppointmentStatus)
        ? resolvedParams.status as AppointmentStatus : 'SCHEDULED'
    const targetDate = new Date(`${dateStr}T00:00:00.000Z`)
    const targetEnd = new Date(`${dateStr}T23:59:59.999Z`)

    const [todayAppts, totalCount, uniqueClients] = await prisma.$transaction([
        prisma.appointment.findMany({ where: { userId, date: { gte: targetDate, lte: targetEnd }, status }, include: { eventType: true }, orderBy: { startTime: 'asc' } }),
        prisma.appointment.count({ where: { userId, status: 'SCHEDULED' } }),
        prisma.appointment.groupBy({ by: ['clientName'], where: { userId } }),
    ])

    const isToday = dateStr === todayDateStr
    const serializedAppts = todayAppts.map(app => ({
        ...app, date: app.date.toISOString(), createdAt: app.createdAt.toISOString(), updatedAt: app.updatedAt.toISOString(),
        eventType: app.eventType ? { ...app.eventType, price: app.eventType.price ? Number(app.eventType.price) : null, createdAt: app.eventType.createdAt.toISOString(), updatedAt: app.eventType.updatedAt.toISOString() } : null
    }))

    const kpis = [
        { label: isToday ? 'Hoje' : 'No dia', value: todayAppts.length, icon: Clock, tone: 'text-indigo-600 bg-indigo-50' },
        { label: 'Agendados', value: totalCount, icon: CalendarCheck, tone: 'text-emerald-600 bg-emerald-50' },
        { label: 'Clientes', value: uniqueClients.length, icon: Users, tone: 'text-slate-700 bg-slate-100' },
        { label: 'Serviços', value: user._count.eventTypes, icon: BriefcaseBusiness, tone: 'text-violet-600 bg-violet-50' },
    ]

    const geminiInsight = isToday && todayAppts.length > 0 ? await (async () => {
        try {
            const { getDashboardInsight } = await import('@/lib/gemini')
            return await getDashboardInsight(user.name || 'Profissional', todayAppts)
        } catch { return null }
    })() : null

    return (
        <div className="page-shell">
            {user._count.availability === 0 && (
                <section className="mb-6 flex flex-col gap-4 rounded-[14px] border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Configuração necessária">
                    <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><Clock size={18} /></span>
                        <div><h2 className="text-sm font-bold text-amber-950">Configure sua disponibilidade</h2><p className="mt-0.5 text-xs leading-5 text-amber-800">Defina seus horários para começar a receber agendamentos.</p></div>
                    </div>
                    <Link href="/settings/availability" className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800">Configurar</Link>
                </section>
            )}

            <header className="page-header">
                <div>
                    <h1 className="page-title">Olá, {user.name?.split(' ')[0] || 'profissional'}</h1>
                    <p className="page-description">{isToday ? 'Aqui está um resumo da sua agenda de hoje.' : `Agenda de ${new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('pt-BR', { dateStyle: 'long', timeZone: 'America/Sao_Paulo' })}.`}</p>
                </div>
                <div className="page-actions">
                    <Link href="/appointment" className="ui-btn ui-btn-primary"><Plus size={17} /> Novo agendamento</Link>
                </div>
            </header>

            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {kpis.map(({ label, value, icon: Icon, tone }) => (
                    <div key={label} className="section-card flex items-center gap-3 p-4 sm:p-5">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon size={19} /></div>
                        <div className="min-w-0"><p className="text-xs font-medium text-slate-500">{label}</p><p className="text-xl font-bold tracking-tight text-slate-900">{value}</p></div>
                    </div>
                ))}
            </div>

            <DashboardViewSwitcher user={user} dateStr={dateStr} status={status} serializedAppts={serializedAppts} isToday={isToday} />

            {geminiInsight && (
                <section className="mt-6 rounded-[14px] border border-indigo-100 bg-indigo-50/60 p-4 sm:p-5" aria-label="Insight da agenda">
                    <div className="flex items-start gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">AI</div><div><p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Insight da agenda</p><p className="mt-1 text-sm leading-6 text-slate-700">{geminiInsight.trim()}</p></div></div>
                </section>
            )}
        </div>
    )
}
