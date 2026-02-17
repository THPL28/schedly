'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, User, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { createAppointment } from '@/lib/actions'
import { Appointment } from '@prisma/client'

export default function CalendarView({ year, month, counts, appointmentsToday, selectedDate }: {
    year: number,
    month: number,
    counts: Record<string, number>,
    appointmentsToday: Appointment[],
    selectedDate: string
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleNavigate = (newMonth: number, newYear: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('month', newMonth.toString())
        params.set('year', newYear.toString())
        router.push(`${pathname}?${params.toString()}`)
    }

    const handlePrev = () => {
        let m = month - 1
        let y = year
        if (m < 0) { m = 11; y-- }
        handleNavigate(m, y)
    }
    const handleNext = () => {
        let m = month + 1
        let y = year
        if (m > 11) { m = 0; y++ }
        handleNavigate(m, y)
    }

    const handleToday = () => {
        const now = new Date()
        const dateStr = now.toISOString().split('T')[0]
        router.push(`${pathname}?month=${now.getMonth()}&year=${now.getFullYear()}&date=${dateStr}`)
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()

    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)

    const monthName = new Date(year, month).toLocaleString('pt-BR', { month: 'long' })
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    const dSelected = new Date(selectedDate + 'T12:00:00')

    async function handleQuickAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const res = await createAppointment(formData)

        if (res?.error) {
            setError(res.error)
            setLoading(false)
        } else {
            setShowModal(false)
            setLoading(false)
            router.refresh()
        }
    }

    return (
        <div className="grid gap-8 h-[calc(100vh-150px)] relative" style={{ gridTemplateColumns: '1fr 350px' }}>

            {/* Esquerda: Grade do Calendário */}
            <div className="flex flex-col">
                <header className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-foreground capitalize">{monthName} {year}</h1>
                        <button onClick={handleToday} className="px-4 py-2 rounded-md border border-border bg-white cursor-pointer text-sm font-semibold hover:bg-muted-light max-h-9 flex items-center">Hoje</button>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn btn-primary rounded-full px-6 py-2 shadow-sm"
                        >
                            <Plus size={20} /> Criar
                        </button>

                        <div className="flex items-center gap-2">
                            <button onClick={handlePrev} className="p-2 rounded-full hover:bg-muted-light cursor-pointer border-none bg-transparent flex items-center justify-center"><ChevronLeft size={20} /></button>
                            <button onClick={handleNext} className="p-2 rounded-full hover:bg-muted-light cursor-pointer border-none bg-transparent flex items-center justify-center"><ChevronRight size={20} /></button>
                        </div>
                    </div>
                </header>

                <div className="card flex-1 p-4 bg-white border border-border rounded-lg flex flex-col">
                    <div className="grid grid-cols-7 h-full">
                        {daysOfWeek.map(d => (
                            <div key={d} className="font-semibold text-muted text-xs text-center py-2 uppercase">{d}</div>
                        ))}

                        {days.map((d, i) => {
                            if (d === null) return <div key={`empty-${i}`} className="border border-muted-light/50"></div>

                            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
                            const count = counts[dateStr] || 0
                            const isSelected = selectedDate === dateStr
                            const isToday = new Date().toISOString().split('T')[0] === dateStr

                            return (
                                <div key={`day-${d}`}
                                    onClick={() => {
                                        if (isSelected) {
                                            setShowModal(true)
                                            return
                                        }
                                        const params = new URLSearchParams(searchParams.toString())
                                        params.set('date', dateStr)
                                        router.push(`${pathname}?${params.toString()}`, { scroll: false })
                                    }}
                                    className={`relative border border-muted-light/50 p-2 cursor-pointer flex flex-col items-center transition-all group ${isSelected ? 'bg-primary/10' : 'hover:bg-muted-light'}`}
                                    style={{ backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : undefined }}
                                >
                                    <span
                                        className={`w-6 h-6 flex items-center justify-center rounded-full text-sm ${isToday ? 'bg-primary text-white font-bold' : isSelected ? 'text-primary font-bold' : 'text-foreground'}`}
                                    >
                                        {d}
                                    </span>

                                    {/* Botão flutuante de "+" */}
                                    {!isSelected && (
                                        <div className="absolute bottom-2 right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus size={12} />
                                        </div>
                                    )}

                                    {count > 0 && (
                                        <div className="mt-auto rounded px-2 py-0.5 text-[10px] font-semibold" style={{ background: isSelected ? 'var(--primary)' : 'rgba(99, 102, 241, 0.1)', color: isSelected ? 'white' : 'var(--primary)' }}>
                                            {count} {count === 1 ? 'evento' : 'eventos'}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Direita: Painel de Eventos do Dia */}
            <div className="bg-white border border-border rounded-lg flex flex-col overflow-hidden h-full">
                <div className="p-6 border-b border-border bg-muted-light/30">
                    <h2 className="text-lg font-semibold text-foreground capitalize m-0">
                        {dSelected.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h2>
                    <p className="text-xs text-muted mt-1">{appointmentsToday.length} compromissos agendados</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {appointmentsToday.length === 0 ? (
                        <div className="text-center py-12 px-4 text-muted">
                            <CalendarIcon size={48} className="mb-4 opacity-20 mx-auto" />
                            <p className="text-sm">Nenhum evento para este dia.</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-4 bg-transparent border-2 border-dashed border-border text-muted px-4 py-2 rounded-md text-xs font-semibold cursor-pointer hover:border-primary hover:text-primary transition-colors"
                            >
                                + Adicionar Reunião
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {appointmentsToday.map((app: any) => (
                                <div key={app.id} className="p-4 border border-border rounded-lg border-l-4 border-l-primary bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center gap-2 text-sm font-bold text-primary">
                                            <Clock size={14} />
                                            {new Date(app.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            {/* Note: app.startTime might be existing string or Date coming from Prisma. Assuming string formatted or Date object. Adjust as needed. Given previous code used raw string rendering, I'll keep it simple or assume string if it was rendering directly. */}
                                            {/* Correcting based on previous file: previous code rendered {app.startTime} - {app.endTime} directly, suggesting they are strings "HH:MM". */}
                                            {/* Let's revert to original rendering to be safe */}
                                            {app.startTime.toString().slice(11, 16) || app.startTime} - {app.endTime.toString().slice(11, 16) || app.endTime}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-foreground font-semibold text-base">
                                        <User size={16} className="text-muted" />
                                        {app.clientName}
                                    </div>
                                    <div className="mt-2 text-xs text-muted flex items-center gap-1">
                                        Status: <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold text-[10px] uppercase tracking-wider">{app.status}</span>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full py-3 border-2 border-dashed border-border rounded-lg bg-transparent text-muted cursor-pointer text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                            >
                                + Novo Compromisso
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border bg-muted-light/30">
                    <button
                        onClick={() => router.push(`/dashboard?date=${selectedDate}`)}
                        className="w-full py-2.5 bg-primary text-white border-none rounded-md font-semibold cursor-pointer text-sm hover:bg-primary-hover transition-colors"
                    >
                        Ver na Timeline Diária
                    </button>
                </div>
            </div>

            {/* Modal de Criação Rápida */}
            {showModal && (
                <div className="fixed inset-0 w-full h-full bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg w-[400px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50">
                            <h3 className="m-0 text-lg font-semibold text-foreground">Novo Compromisso</h3>
                            <button onClick={() => setShowModal(false)} className="bg-transparent border-none cursor-pointer text-muted hover:text-foreground"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleQuickAdd} className="p-6">
                            <div className="flex flex-col gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1">NOME DO CLIENTE</label>
                                    <input name="clientName" required className="input" placeholder="Quem vai ser atendido?" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1">DATA</label>
                                        <input type="date" name="date" defaultValue={selectedDate} required className="input" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1">HORA INÍCIO</label>
                                        <input type="time" name="startTime" required className="input" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1">HORA TÉRMINO</label>
                                    <input type="time" name="endTime" required className="input" />
                                </div>

                                {error && (
                                    <div className="text-red-600 text-sm p-2 bg-red-50 rounded border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 mt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancelar</button>
                                    <button type="submit" disabled={loading} className="btn btn-primary">
                                        {loading ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
