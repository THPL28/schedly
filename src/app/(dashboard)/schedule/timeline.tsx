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
        <div style={{ paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>Visualizando</span>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{displayDay}</h3>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Month Navigator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <button onClick={() => handleMonthChange(-1)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}>Mês ant.</button>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'capitalize' }}>{displayMonth}</span>
                        <button onClick={() => handleMonthChange(1)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}>Próx. mês</button>
                    </div>

                    {/* Day Navigator */}
                    <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
                        <button onClick={handlePrev} style={{ padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} className="hover-item">
                            <ChevronLeft size={18} />
                        </button>
                        <div style={{ padding: '0.4rem 1rem', borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', minWidth: '140px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1e293b' }}>Mudar Dia</span>
                        </div>
                        <button onClick={handleNext} style={{ padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} className="hover-item">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ padding: '0.75rem 1.25rem', borderRadius: '0.75rem' }}>
                    <Plus size={18} />
                    <span>Agendar</span>
                </button>
            </div>

            <section style={{ background: '#f8fafc', borderRadius: '1.25rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {hours.map((h, i) => {
                    const timeStr = `${h.toString().padStart(2, '0')}:00`
                    const isLunch = h === 12
                    const apptsInSlot = appointments.filter(a => {
                        const [ah] = a.startTime.split(':').map(Number)
                        return ah === h
                    })

                    return (
                        <div key={h} className="timeline-row" style={{ display: 'flex', minHeight: '80px', borderBottom: i < hours.length - 1 ? '1px solid #f1f5f9' : 'none', position: 'relative' }}>
                            <div style={{ width: '80px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '1rem', borderRight: '1px solid #f1f5f9', background: '#f8fafc' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8' }}>{timeStr}</span>
                            </div>

                            <div style={{ flex: 1, padding: '0.5rem', position: 'relative', display: 'flex', alignItems: 'center' }}>
                                {isLunch && apptsInSlot.length === 0 ? (
                                    <div style={{ width: '100%', textAlign: 'center', color: '#cbd5e1', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', fontStyle: 'italic' }}>Intervalo</div>
                                ) : apptsInSlot.length > 0 ? (
                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        {apptsInSlot.map(a => (
                                            <div key={a.id} style={{
                                                background: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '0.75rem',
                                                padding: '0.75rem 1rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                            }}>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>{a.clientName}</h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', color: '#64748b', fontSize: '0.75rem' }}>
                                                        <Clock size={12} />
                                                        <span>{a.startTime} — {a.endTime}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={async () => { if (confirm('Cancelar?')) await cancelAppointment(a.id); }}
                                                    style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '0.4rem', borderRadius: '0.5rem', cursor: 'pointer' }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleSlotClick(h)}
                                        className="add-btn"
                                        style={{
                                            width: '100%',
                                            height: '40px',
                                            border: '1px dashed #e2e8f0',
                                            borderRadius: '0.5rem',
                                            background: 'none',
                                            color: '#94a3b8',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            cursor: 'pointer'
                                        }}
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
