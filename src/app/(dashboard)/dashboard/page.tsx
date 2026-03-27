import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
    Clock,
    Users,
    CalendarCheck,
} from 'lucide-react'
import Link from 'next/link'
import DashboardViewSwitcher from '@/app/(dashboard)/dashboard/dashboard-view-switcher'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ date?: string, status?: string }> }) {
    const session = await verifySession()
    if (!session) redirect('/login')

    const resolvedParams = await searchParams
    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        include: {
            subscription: true,
            _count: { select: { availability: true, eventTypes: true } }
        }
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
        { label: isToday ? 'Agendamentos p/ Hoje' : 'No Dia Selecionado', value: todayAppts.length, icon: Clock, color: 'text-primary', bg: 'bg-primary/5' },
        { label: 'Total de Confirmados', value: totalCount, icon: CalendarCheck, color: 'text-success', bg: 'bg-success/5' },
        { label: 'Clientes Registrados', value: uniqueClients.length, icon: Users, color: 'text-secondary', bg: 'bg-secondary/5' },
    ]

    const geminiInsight = isToday ? await (async () => {
        try {
            const { getDashboardInsight } = await import('@/lib/gemini');
            return await getDashboardInsight(user.name || 'Profissional', todayAppts);
        } catch (e) { return null; }
    })() : null;

    return (
        <div className="p-4 sm:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-700">
            {user._count.availability === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm shadow-amber-200/20 animate-in slide-in-from-top-4 duration-1000">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                            <Clock size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight">Sua agenda está inativa!</h3>
                            <p className="text-slate-500 font-medium text-sm max-w-lg leading-relaxed">
                                Notamos que você ainda não configurou seus horários de trabalho. Sem isso, seus clientes não conseguirão agendar serviços com você.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/settings/availability"
                        className="bg-slate-900 text-white h-14 px-10 rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-xs hover:bg-amber-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 shrink-0"
                    >
                        Configurar agora
                    </Link>
                </div>
            )}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">
                        Olá, {user?.name?.split(' ')[0]}!
                    </h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
                        {isToday ? 'Estes são seus compromissos para hoje.' : `Visualizando agenda para ${new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { dateStyle: 'long' })}`}
                    </p>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-full lg:w-auto">
                    <Link
                        href={`?date=${dateStr}&status=SCHEDULED`}
                        className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${status === 'SCHEDULED' ? 'bg-white text-slate-900 shadow-md shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Confirmados
                    </Link>
                    <Link
                        href={`?date=${dateStr}&status=CANCELED`}
                        className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${status === 'CANCELED' ? 'bg-white text-slate-900 shadow-md shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Cancelados
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-4 hover:border-primary/20 transition-all hover:translate-y-[-4px] shadow-sm hover:shadow-xl shadow-slate-200/50">
                        <div
                            className={`flex items-center justify-center rounded-2xl flex-shrink-0 w-14 h-14 ${kpi.bg} ${kpi.color} shadow-inner`}
                        >
                            <kpi.icon size={26} />
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-[0.2em] leading-none">{kpi.label}</p>
                            <p className="text-3xl font-black text-slate-900 m-0 leading-none">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {geminiInsight && (
                <div className="mb-12 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-indigo-500/30 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-white border border-border/50 rounded-[2.5rem] p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shrink-0 shadow-xl shadow-primary/20 animate-pulse">
                            <span className="text-2xl">AI</span>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[9px] font-black px-3 py-1 rounded-full mb-3 uppercase tracking-widest border border-primary/10">
                                Schedly Intelligence
                            </div>
                            <p className="text-lg sm:text-xl font-medium text-slate-700 leading-relaxed italic">
                                "{geminiInsight.trim()}"
                            </p>
                        </div>
                        <div className="hidden lg:block shrink-0 px-8 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Powered by Gemini 1.5
                        </div>
                    </div>
                </div>
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
