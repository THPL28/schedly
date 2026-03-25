'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Timeline from '../schedule/timeline'
import PerformanceChart from '@/components/dashboard/performance-chart'
import QuickActions from '@/components/dashboard/quick-actions'
import { Calendar, Clock, Settings, User, BarChart3, Plus, Sparkles, Wand2, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function DashboardViewSwitcher({ 
    user, 
    dateStr, 
    status, 
    serializedAppts, 
    isToday 
}: any) {
    const searchParams = useSearchParams()
    const activeTab = searchParams.get('tab') || 'agenda'
    const [isMounted, setIsMounted] = useState(false)
    const [isTimelineExpanded, setTimelineExpanded] = useState(true)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <div className="relative">
            {/* Content Area with Magic Transitions - HeaderTabs now controls this via URL */}
            <div className="min-h-[600px] mb-20">
                {activeTab === 'agenda' && (
                    <div key={status} className="animate-in fade-in slide-in-from-right-10 duration-700">
                        <div className="bg-white p-6 sm:p-10 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-16 relative z-10 border-b border-slate-50 pb-12">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3 group-hover:rotate-0 transition-all duration-500">
                                        <Wand2 size={28} className="animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-900 leading-none mb-2 tracking-tighter">Sua Agenda</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-2 px-3 py-1 bg-success/10 text-success text-[9px] font-black uppercase tracking-widest rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping"></span>
                                                {status === 'SCHEDULED' ? 'Confirmados' : 'Cancelados'}
                                            </span>
                                            <button 
                                                onClick={() => setTimelineExpanded(!isTimelineExpanded)}
                                                className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full cursor-pointer hover:bg-primary/5 border border-slate-100"
                                            >
                                                {isTimelineExpanded ? 'Contrair Agenda' : 'Expandir Agenda'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <Link 
                                        href="/calendar" 
                                        className="flex-1 sm:flex-none group flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] py-5 px-10 rounded-2xl bg-white border-2 border-slate-100 text-slate-600 hover:border-primary/20 hover:bg-primary hover:text-white transition-all duration-500 shadow-sm active:scale-95"
                                    >
                                        Calendário Completo
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                            
                            <div className={`transition-all duration-700 ease-in-out overflow-hidden ${isTimelineExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <Timeline date={dateStr} appointments={serializedAppts} />
                            </div>

                            {!isTimelineExpanded && (
                                <div className="py-12 text-center animate-in fade-in zoom-in duration-500 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                                    <Calendar className="mx-auto mb-4 text-slate-300" size={40} />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Agenda em modo compacto</p>
                                    <button 
                                        onClick={() => setTimelineExpanded(true)}
                                        className="mt-6 text-primary font-black uppercase tracking-widest text-[11px] hover:underline"
                                    >
                                        Clique para visualizar seus compromissos
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'disponibilidade' && (
                    <div className="animate-in slide-in-from-bottom-10 fade-in duration-700">
                        <div className="bg-primary p-10 sm:p-16 rounded-[3rem] shadow-2xl shadow-primary/30 text-white relative overflow-hidden">
                             {/* Magic Gradient Bg */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
                            <div className="absolute top-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-[100px] animate-pulse"></div>

                            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                                <div className="animate-in slide-in-from-left-6 duration-700">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/20 mb-8">
                                        <Clock size={14} className="text-white" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Configuração de Horário</span>
                                    </div>
                                    <h2 className="text-5xl font-black leading-tight mb-6">Controle sua <span className="text-amber-300">Jornada</span> de Trabalho</h2>
                                    <p className="text-white/80 text-lg font-medium mb-10 max-w-md leading-relaxed">
                                        Defina seus turnos semanais e exceções para que o Schedly possa gerenciar sua agenda automaticamente.
                                    </p>
                                    
                                    <div className="space-y-4 mb-10">
                                        {[
                                            'Defina horários recorrentes por dia',
                                            'Crie pausas e intervalos de almoço',
                                            'Bloqueie datas específicas (folgas)',
                                            'Sincronização em tempo real'
                                        ].map((tool, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                                                    <CheckCircle2 size={14} />
                                                </div>
                                                <span className="font-bold text-sm text-white uppercase tracking-widest">{tool}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link href="/settings/availability" className="inline-flex items-center justify-center h-16 px-10 rounded-[1.5rem] bg-white text-primary font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl">
                                        Configurar Horários
                                    </Link>
                                </div>

                                <div className="hidden lg:block animate-in zoom-in duration-1000">
                                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 rotate-3 shadow-2xl">
                                        <div className="space-y-6">
                                            {[
                                                { day: 'Segunda', time: '09:00 - 18:00', active: true },
                                                { day: 'Terça', time: '09:00 - 18:00', active: true },
                                                { day: 'Quarta', time: 'Intervalo', active: false },
                                                { day: 'Quinta', time: '09:00 - 20:00', active: true },
                                            ].map((d, i) => (
                                                <div key={i} className={`flex items-center justify-between p-4 rounded-2xl ${d.active ? 'bg-white/20' : 'bg-transparent border border-white/10 opacity-40'}`}>
                                                    <span className="text-sm font-black uppercase tracking-widest">{d.day}</span>
                                                    <span className="text-[10px] font-black">{d.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="animate-in fade-in duration-700">
                        <PerformanceChart />
                    </div>
                )}

                {activeTab === 'servicos' && (
                    <div className="animate-in slide-in-from-right-10 fade-in duration-700">
                        <div className="bg-gradient-to-tr from-[#f8fafc] to-[#e2e8f0] p-10 sm:p-20 rounded-[3rem] shadow-2xl border border-white relative overflow-hidden text-center">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
                                <Sparkles size={400} className="w-full h-full text-primary animate-pulse" />
                            </div>
                            
                            <div className="relative z-10 max-w-2xl mx-auto">
                                <div className="w-24 h-24 bg-primary text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-primary/30 rotate-12">
                                    <Settings size={40} />
                                </div>
                                <h3 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Personalize seus <span className="text-primary underline decoration-primary/20">Serviços</span></h3>
                                <p className="text-slate-500 text-xl font-medium mb-12 leading-relaxed">Crie experiências únicas de agendamento para seus clientes. Defina durações, preços e requisitos personalizados.</p>
                                
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/settings/event-types" className="btn btn-primary h-16 px-12 rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/30">
                                        Criar Novo Serviço
                                    </Link>
                                    <Link href="/settings/event-types" className="btn bg-white border border-slate-200 text-slate-600 h-16 px-12 rounded-[1.5rem] text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                                        Ver Painel de Vendas
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
