'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelAppointment } from '@/lib/actions'
import BookingModal from './booking-modal'
import {
    ChevronLeft,
    ChevronRight,
    X,
    Plus,
    Clock,
    Pencil,
    CalendarDays,
    Calendar,
    ArrowLeft,
    ArrowRight,
    MessageCircle
} from 'lucide-react'

export default function Timeline({ date, appointments }: { date: string, appointments: any[] }) {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState<string>('09:00')

    const d = new Date(date + 'T12:00:00')
    const displayMonth = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    const displayDay = d.toLocaleString('pt-BR', { weekday: 'long', day: 'numeric' })

    const handlePrev = () => {
        const prev = new Date(d)
        prev.setDate(prev.getDate() - 1)
        router.push(`?date=${prev.toISOString().split('T')[0]}`, { scroll: false })
    }

    const handleNext = () => {
        const next = new Date(d)
        next.setDate(next.getDate() + 1)
        router.push(`?date=${next.toISOString().split('T')[0]}`, { scroll: false })
    }

    const handleMonthChange = (months: number) => {
        const next = new Date(d)
        next.setMonth(next.getMonth() + months)
        router.push(`?date=${next.toISOString().split('T')[0]}`, { scroll: false })
    }

    const handleSlotClick = (h: number) => {
        setSelectedSlot(`${h.toString().padStart(2, '0')}:00`)
        setIsModalOpen(true)
    }

    const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7 to 20

    return (
        <div className="animate-in fade-in duration-700">
            {/* Control Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 rotate-3">
                        <Calendar size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Agenda Diária</p>
                        <h3 className="text-2xl font-black text-slate-900 capitalize leading-none">{displayDay}</h3>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    {/* Month Navigator */}
                    <div className="flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/60 w-full sm:w-auto justify-between sm:justify-start">
                        <button onClick={() => handleMonthChange(-1)} className="w-8 h-8 rounded-xl hover:bg-white flex items-center justify-center transition-all text-slate-400 hover:text-slate-900">
                            <ArrowLeft size={16} />
                        </button>
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest px-6 min-w-[140px] text-center">{displayMonth}</span>
                        <button onClick={() => handleMonthChange(1)} className="w-8 h-8 rounded-xl hover:bg-white flex items-center justify-center transition-all text-slate-400 hover:text-slate-900">
                            <ArrowRight size={16} />
                        </button>
                    </div>

                    {/* Day Navigator */}
                    <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm w-full sm:w-auto">
                        <button onClick={handlePrev} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center transition-all text-slate-900">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="px-6 border-l border-r border-slate-100 min-w-[120px] text-center">
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Mudar Dia</span>
                        </div>
                        <button onClick={handleNext} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center transition-all text-slate-900">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary h-12 px-8 rounded-2xl shadow-lg shadow-primary/20 w-full sm:w-auto font-black uppercase tracking-widest text-xs">
                        <Plus size={16} />
                        Novo Agendamento
                    </button>
                </div>
            </div>

            {/* Timeline Grid */}
            <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-inner">
                {hours.map((h, i) => {
                    const timeStr = `${h.toString().padStart(2, '0')}:00`
                    const isLunch = h === 12
                    const apptsInSlot = appointments.filter(a => {
                        const [ah] = a.startTime.split(':').map(Number)
                        return ah === h
                    })

                    return (
                        <div key={h} className="group relative flex min-h-[90px] border-b border-white/40 last:border-b-0 hover:bg-white transition-all duration-500">
                            <div className="w-[80px] sm:w-[100px] flex items-start justify-center pt-6 border-r border-white/60">
                                <span className="text-xs font-black text-slate-900 opacity-30 group-hover:opacity-100 transition-opacity">{timeStr}</span>
                            </div>

                            <div className="flex-1 p-4 relative flex items-center">
                                {isLunch && apptsInSlot.length === 0 ? (
                                    <div className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 italic">Pausa para Almoço</div>
                                ) : apptsInSlot.length > 0 ? (
                                    <div className="w-full flex flex-col gap-2">
                                        {apptsInSlot.map(a => (
                                            <div key={a.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-lg shadow-slate-200/40 gap-4 animate-in slide-in-from-left-4 duration-500">
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                                                        <Clock size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="m-0 text-sm font-black text-slate-900 truncate">{a.clientName}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            {a.eventType && (
                                                                <span className="text-[9px] text-primary font-black uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">{a.eventType.name}</span>
                                                            )}
                                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{a.startTime} — {a.endTime}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {a.clientPhone && (
                                                        <a 
                                                            href={`https://wa.me/${a.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${a.clientName}, aqui é da equipe do Schedlyfy. Gostaria de confirmar seu agendamento de ${a.eventType?.name || 'serviço'} para hoje às ${a.startTime}. Nos vemos lá!`)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                                            title="Lembrete WhatsApp"
                                                        >
                                                            <MessageCircle size={18} />
                                                        </a>
                                                    )}
                                                    <button 
                                                        onClick={async () => { if (confirm('Tem certeza que deseja cancelar?')) await cancelAppointment(a.id); }} 
                                                        className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border-none"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleSlotClick(h)}
                                        className="w-full h-12 border-2 border-dashed border-slate-200 rounded-2xl bg-transparent opacity-0 group-hover:opacity-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:border-primary hover:text-primary transition-all duration-300 active:scale-[0.98]"
                                    >
                                        + Abrir Horário
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {isModalOpen && (
                <BookingModal
                    date={date}
                    startTime={selectedSlot}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    )
}
