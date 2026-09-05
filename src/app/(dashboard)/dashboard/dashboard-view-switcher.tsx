'use client'

import { useSearchParams } from 'next/navigation'
import Timeline from '../schedule/timeline'
import PerformanceChart from '@/components/dashboard/performance-chart'
import { Calendar, Clock, Settings, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

type ViewProps = {
    user: { id: string; name: string | null }
    dateStr: string
    status: 'SCHEDULED' | 'CANCELED'
    serializedAppts: any[]
    isToday: boolean
}

export default function DashboardViewSwitcher({ dateStr, status, serializedAppts }: ViewProps) {
    const searchParams = useSearchParams()
    const activeTab = searchParams.get('tab') || 'agenda'

    if (activeTab === 'analytics') {
        return <div className="section-card p-4 sm:p-6"><PerformanceChart /></div>
    }

    if (activeTab === 'disponibilidade') {
        return (
            <section className="section-card overflow-hidden">
                <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Clock size={19} /></div>
                        <div><h2 className="text-base font-bold text-slate-900">Disponibilidade</h2><p className="mt-1 max-w-xl text-sm leading-5 text-slate-500">Defina os dias e horários em que seus clientes podem agendar.</p></div>
                    </div>
                    <Link href="/settings/availability" className="ui-btn ui-btn-primary shrink-0">Editar horários <ArrowRight size={16} /></Link>
                </div>
            </section>
        )
    }

    if (activeTab === 'servicos') {
        return (
            <section className="section-card overflow-hidden">
                <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Settings size={19} /></div>
                        <div><h2 className="text-base font-bold text-slate-900">Serviços</h2><p className="mt-1 max-w-xl text-sm leading-5 text-slate-500">Gerencie duração, preço e informações exibidas na sua página de agendamento.</p></div>
                    </div>
                    <Link href="/settings/event-types" className="ui-btn ui-btn-primary shrink-0">Gerenciar serviços <ArrowRight size={16} /></Link>
                </div>
            </section>
        )
    }

    return (
        <section className="section-card overflow-hidden">
            <div className="border-b border-slate-100 p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Calendar size={18} /></div>
                        <div><h2 className="text-sm font-bold text-slate-900">Agenda de hoje</h2><p className="text-xs text-slate-500">{status === 'SCHEDULED' ? 'Acompanhe seus próximos compromissos.' : 'Visualizando compromissos cancelados.'}</p></div>
                    </div>
                    <Link href="/calendar" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700">Abrir calendário completo <ArrowRight size={14} /></Link>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Link href="/settings/availability" className="group flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5 transition hover:border-indigo-100 hover:bg-indigo-50/50">
                        <Clock size={15} className="text-indigo-600" /><span className="text-xs font-semibold text-slate-700">Horários</span><ArrowRight size={13} className="ml-auto text-slate-300 transition group-hover:text-indigo-500" />
                    </Link>
                    <Link href="/settings/event-types" className="group flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5 transition hover:border-indigo-100 hover:bg-indigo-50/50">
                        <Settings size={15} className="text-slate-600" /><span className="text-xs font-semibold text-slate-700">Serviços</span><ArrowRight size={13} className="ml-auto text-slate-300 transition group-hover:text-indigo-500" />
                    </Link>
                    <Link href="/reports" className="group flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5 transition hover:border-indigo-100 hover:bg-indigo-50/50">
                        <Sparkles size={15} className="text-violet-600" /><span className="text-xs font-semibold text-slate-700">Relatórios</span><ArrowRight size={13} className="ml-auto text-slate-300 transition group-hover:text-indigo-500" />
                    </Link>
                </div>
            </div>
            <div className="p-3 sm:p-5"><Timeline date={dateStr} appointments={serializedAppts} showPrimaryAction={false} /></div>
        </section>
    )
}
