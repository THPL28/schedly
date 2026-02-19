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
    CalendarDays
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
        <div className="pb-4 sm:pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex flex-col">
                        <span className="text-[11px] sm:text-xs font-extrabold text-muted uppercase mb-0">Visualizando</span>
                        <h3 className="text-base sm:text-lg font-extrabold m-0">{displayDay}</h3>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2 w-full sm:w-auto">
                    {/* Month Navigator */}
                    <div className="flex items-center gap-2 mb-0 sm:mb-2">
                        <button onClick={() => handleMonthChange(-1)} className="btn btn-outline px-2 py-1 text-[11px]">Mês ant.</button>
                        <span className="text-sm font-bold text-slate-600 capitalize">{displayMonth}</span>
                        <button onClick={() => handleMonthChange(1)} className="btn btn-outline px-2 py-1 text-[11px]">Próx. mês</button>
                    </div>

                    {/* Day Navigator */}
                    <div className="flex items-center bg-white border border-border rounded-[12px] overflow-hidden flex-1 sm:flex-none">
                        <button onClick={handlePrev} className="hover-item p-2 text-muted border-none bg-transparent cursor-pointer">
                            <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <div className="px-3 sm:px-4 border-l border-r border-[#f1f5f9] min-w-[100px] sm:min-w-[140px] text-center flex-1">
                            <span className="text-xs sm:text-sm font-extrabold text-slate-800">Mudar Dia</span>
                        </div>
                        <button onClick={handleNext} className="hover-item p-2 text-muted border-none bg-transparent cursor-pointer">
                            <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                    </div>
                </div>

                <button onClick={() => setIsModalOpen(true)} className="btn btn-primary w-full sm:w-auto py-3 sm:py-4 px-4 sm:px-5 rounded-md text-sm sm:text-base">
                    <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Agendar</span>
                </button>
            </div>

            <section className="bg-[#f8fafc] rounded-[1.25rem] border border-[#e2e8f0] overflow-hidden">
                {hours.map((h, i) => {
                    const timeStr = `${h.toString().padStart(2, '0')}:00`
                    const isLunch = h === 12
                    const apptsInSlot = appointments.filter(a => {
                        const [ah] = a.startTime.split(':').map(Number)
                        return ah === h
                    })

                    return (
                        <div key={h} className="timeline-row flex min-h-[80px] border-b last:border-b-0 relative">
                            <div className="w-[60px] sm:w-[80px] flex items-start justify-center pt-3 sm:pt-4 border-r border-[#f1f5f9] bg-[#f8fafc] text-xs sm:text-sm">
                                <span className="text-xs font-extrabold text-muted">{timeStr}</span>
                            </div>

                            <div className="flex-1 p-2 relative flex items-center">
                                {isLunch && apptsInSlot.length === 0 ? (
                                    <div className="w-full text-center text-[0.7rem] font-semibold uppercase italic text-slate-300">Intervalo</div>
                                ) : apptsInSlot.length > 0 ? (
                                    <div className="w-full flex flex-col gap-1">
                                        {apptsInSlot.map(a => (
                                            <div key={a.id} className="bg-white border border-border rounded-xl p-2.5 sm:p-3 flex justify-between items-center shadow-sm gap-2 min-w-0">
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h4 className="m-0 text-sm sm:text-[0.9rem] font-extrabold text-slate-900 truncate">{a.clientName}</h4>
                                                    <div className="flex items-center gap-1 mt-1 text-[0.7rem] sm:text-[0.75rem] text-slate-500">
                                                        <Clock size={11} className="sm:w-3 sm:h-3" />
                                                        <span>{a.startTime} — {a.endTime}</span>
                                                    </div>
                                                </div>

                                                <button onClick={async () => { if (confirm('Cancelar?')) await cancelAppointment(a.id); }} className="bg-red-50 text-red-600 px-2 py-1 rounded-md cursor-pointer flex-shrink-0 border-none">
                                                    <X size={12} className="sm:w-[14px] sm:h-[14px]" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleSlotClick(h)}
                                        className="w-full h-10 border-dashed border border-border rounded-md bg-transparent text-muted text-xs font-bold uppercase cursor-pointer"
                                    >
                                        + Disponível
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </section>

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
