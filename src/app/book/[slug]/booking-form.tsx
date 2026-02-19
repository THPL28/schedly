'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { bookAppointmentPublic } from '@/lib/actions'
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Calendar as CalendarIcon
} from 'lucide-react'

export default function BookingForm({ providerId, initialDate, busyAppointments }: { providerId: string, initialDate: string, busyAppointments: any[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [feedback, setFeedback] = useState<'success' | 'error' | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    // Parse the date from URL or props
    const currentDate = new Date(initialDate + 'T12:00:00')
    const [viewDate, setViewDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))

    // Update view date if initialDate props changes (from router.push)
    useEffect(() => {
        const d = new Date(initialDate + 'T12:00:00')
        setViewDate(new Date(d.getFullYear(), d.getMonth(), 1))
    }, [initialDate])

    const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 08:00 to 20:00

    const isBusy = (h: number) => {
        return busyAppointments.some(a => {
            const [ah] = a.startTime.split(':').map(Number)
            return ah === h
        })
    }

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

    const handleMonthChange = (e: React.MouseEvent, offset: number) => {
        e.preventDefault()
        e.stopPropagation()
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1)
        setViewDate(newDate)
    }

    const selectDate = (e: React.MouseEvent, day: number) => {
        e.preventDefault()
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 12)
        const dateStr = d.toISOString().split('T')[0]
        router.push(`?date=${dateStr}`, { scroll: false })
        setSelectedTime(null)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!selectedTime) return

        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        formData.append('providerId', providerId)
        formData.append('startTime', selectedTime)

        const [h] = selectedTime.split(':').map(Number)
        formData.append('endTime', `${(h).toString().padStart(2, '0')}:30`)

        // If offline, queue the public booking in the service worker and return optimistic success
        if (typeof navigator !== 'undefined' && !navigator.onLine && 'serviceWorker' in navigator) {
            try {
                const payload = Object.fromEntries(formData as any as Iterable<[string, string]>)
                payload.type = 'public'
                const reg = await navigator.serviceWorker.ready
                reg.active?.postMessage({ type: 'QUEUE_APPOINTMENT', payload })
                try { await reg.sync.register('sync-appointments') } catch (e) { /* ignore */ }

                setLoading(false)
                setFeedback('success')
                setSelectedTime(null)
                return
            } catch (err) {
                setLoading(false)
                setError('Falha ao enfileirar agendamento offline')
                setFeedback('error')
                setTimeout(() => setFeedback(null), 3000)
                return
            }
        }

        const res = await bookAppointmentPublic(formData)
        if (res?.error) {
            setError(res.error)
            setFeedback('error')
            setLoading(false)
            setTimeout(() => setFeedback(null), 3000)
        } else {
            setFeedback('success')
            setLoading(false)
            setSelectedTime(null)
        }
    }

    if (feedback === 'success') {
        return (
            <div className="text-center py-12 px-8 bg-white min-h-[400px] flex flex-col justify-center items-center">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <CheckCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Agendado!</h3>
                <p className="text-muted mb-10">O compromisso foi adicionado à agenda.</p>
                <button type="button" onClick={() => window.location.reload()} className="h-9 px-6 bg-primary text-white border-none rounded-md font-medium cursor-pointer text-sm hover:bg-primary-hover">OK</button>
            </div>
        )
    }

    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth())
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth())
    const calendarDays = []
    for (let i = 0; i < firstDay; i++) calendarDays.push(null)
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

    return (
        <div className="bg-white min-h-[500px]">
            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row flex-wrap">

                {/* Lateral Esquerda: Calendário */}
                <div className="flex-auto p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-border min-w-0 lg:min-w-[300px]">
                    <input type="hidden" name="date" value={initialDate} />

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-foreground capitalize">
                            {viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                        </span>
                        <div className="flex gap-1">
                            <button type="button" onClick={(e) => handleMonthChange(e, -1)} className="p-2 border-none bg-none cursor-pointer text-muted rounded-full flex items-center justify-center hover:bg-muted-light"><ChevronLeft size={18} /></button>
                            <button type="button" onClick={(e) => handleMonthChange(e, 1)} className="p-2 border-none bg-none cursor-pointer text-muted rounded-full flex items-center justify-center hover:bg-muted-light"><ChevronRight size={18} /></button>
                        </div>
                    </div>

                    {/* Grade do Calendário */}
                    <div className="grid grid-cols-7 text-center mb-2">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                            <div key={`${d}-${i}`} className="text-[11px] font-medium text-muted py-2">{d}</div>
                        ))}
                        {calendarDays.map((day, i) => {
                            if (day === null) return <div key={`empty-${i}`}></div>
                            const isSelected = currentDate.getDate() === day && currentDate.getMonth() === viewDate.getMonth() && currentDate.getFullYear() === viewDate.getFullYear()
                            const isToday = new Date().getDate() === day && new Date().getMonth() === viewDate.getMonth() && new Date().getFullYear() === viewDate.getFullYear()

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={(e) => selectDate(e, day)}
                                    className={`w-8 h-8 mx-auto my-0.5 rounded-full text-xs flex items-center justify-center cursor-pointer transition-colors
                                        ${isSelected ? 'bg-primary/20 text-primary font-bold' : isToday ? 'border border-border text-primary font-bold' : 'bg-transparent text-foreground hover:bg-muted-light'}
                                    `}
                                >
                                    {day}
                                </button>
                            )
                        })}
                    </div>

                    {/* Detalhes do Evento */}
                    <div className="flex flex-col gap-6 mt-6">
                        <div className="flex gap-4 items-start">
                            <User size={20} className="text-muted mt-2.5" />
                            <div className="flex-1">
                                <input
                                    name="clientName"
                                    required
                                    placeholder="Adicionar título/nome"
                                    className="w-full py-2 text-xl outline-none text-foreground border-b border-border focus:border-b-2 focus:border-primary font-sans bg-transparent placeholder:text-muted/50"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 items-center text-foreground text-sm">
                            <CalendarIcon size={20} className="text-muted" />
                            <span className="font-medium">{currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>
                    </div>
                </div>

                {/* Coluna Direita: Seleção de Horário */}
                <div className="w-full lg:w-[260px] flex-none bg-white p-6 border-l border-border flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-muted">
                        <Clock size={18} />
                        <span className="text-xs font-medium uppercase tracking-wider">Horários</span>
                    </div>

                    <div className="flex-1 flex flex-col gap-1 max-h-[350px] overflow-y-auto pr-2">
                        {hours.map(h => {
                            const t = `${h.toString().padStart(2, '0')}:00`
                            const busy = isBusy(h)
                            const selected = selectedTime === t

                            return (
                                <button
                                    key={h}
                                    type="button"
                                    disabled={busy}
                                    onClick={() => setSelectedTime(t)}
                                    className={`w-full py-2 px-3 rounded border text-sm text-left flex justify-between items-center transition-colors cursor-pointer
                                        ${busy ? 'bg-muted-light text-muted border-transparent cursor-not-allowed' :
                                            selected ? 'bg-primary/10 border-primary text-primary font-medium' :
                                                'bg-transparent border-transparent text-foreground hover:bg-muted-light'}
                                    `}
                                >
                                    <span>{t}</span>
                                    {busy && <span className="text-[10px] font-medium opacity-70">Ocupado</span>}
                                </button>
                            )
                        })}
                    </div>

                    <div className="mt-6">
                        {feedback === 'error' && (
                            <div className="text-red-600 text-xs mb-3 flex items-center gap-2 p-2 bg-red-50 rounded">
                                <XCircle size={14} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !selectedTime}
                            className={`w-full bg-primary text-white border-none py-2.5 px-6 rounded font-medium cursor-pointer text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
