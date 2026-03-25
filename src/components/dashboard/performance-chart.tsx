'use client'

import { TrendingUp, Users, Calendar, DollarSign, ArrowUpRight, Target } from 'lucide-react'

export default function PerformanceChart({ 
    data = [], 
    weeklyGrowth = "+0%" 
}: { 
    data?: { day: string, val: number }[], 
    weeklyGrowth?: string 
}) {
    // Fallback if no data
    const chartData = data.length > 0 ? data : [
        { day: 'Seg', val: 0 },
        { day: 'Ter', val: 0 },
        { day: 'Qua', val: 0 },
        { day: 'Qui', val: 0 },
        { day: 'Sex', val: 0 },
        { day: 'Sáb', val: 0 },
        { day: 'Dom', val: 0 },
    ]

    const max = Math.max(...chartData.map(s => s.val), 10)

    return (
        <div className="bg-white p-6 sm:p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 animate-in zoom-in-95 duration-700">
            <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                        <TrendingUp size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Crescimento Semanal</span>
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">Volume de <span className="text-primary tracking-tighter">Atividade</span></h3>
                    <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10 max-w-sm">
                        Seu desempenho cresceu <span className="text-success font-black">{weeklyGrowth}</span> em relação à semana passada. Continue assim!
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 group hover:bg-primary hover:text-white transition-all duration-500">
                            <Target size={24} className="text-primary group-hover:text-white mb-4 group-hover:scale-110 transition-transform" />
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Taxa de Ocupação</p>
                            <p className="text-2xl font-black tracking-tight">82%</p>
                        </div>
                        <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 group hover:bg-primary hover:text-white transition-all duration-500">
                            <Users size={24} className="text-secondary group-hover:text-white mb-4 group-hover:scale-110 transition-transform" />
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Novos Clientes</p>
                            <p className="text-2xl font-black tracking-tight">+14</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 pt-10">
                    <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 relative shadow-inner">
                        <div className="h-[250px] flex items-end justify-between gap-3 px-2">
                            {chartData.map((s, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                    <div className="relative w-full flex justify-center">
                                         {/* Tooltip on hover */}
                                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-xl -translate-y-2 group-hover:translate-y-0 whitespace-nowrap shadow-xl">
                                            {s.val} Agend.
                                        </div>
                                        {/* Bar */}
                                        <div 
                                            className="w-full sm:w-8 bg-primary/20 rounded-full transition-all duration-1000 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                            style={{ height: `${(s.val/max)*100}%`, animationDelay: `${i * 100}ms` }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300 group-hover:text-slate-900 transition-colors uppercase tracking-widest">{s.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-primary/20 border-2 border-primary"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atividade Diária</span>
                        </div>
                        <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform cursor-pointer">
                            Exportar PDF
                            <ArrowUpRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
