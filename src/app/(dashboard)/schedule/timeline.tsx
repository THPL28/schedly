'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cancelAppointment } from '@/lib/actions'
import BookingModal from '@/app/(dashboard)/schedule/booking-modal'
import FeedbackBanner from '@/components/feedback-banner'
import { ChevronLeft, ChevronRight, X, Plus, Clock, Calendar, ArrowLeft, ArrowRight, MessageCircle, Stethoscope } from 'lucide-react'

type FeedbackState = { variant: 'success' | 'error' | 'info'; title: string; message: string } | null

type Appointment = {
    id: string
    clientId?: string | null
    clientName: string
    clientPhone?: string | null
    startTime: string
    endTime: string
    eventType?: { name: string } | null
}

export default function Timeline({ date, appointments, showPrimaryAction = true, isMedical = false }: { date: string, appointments: Appointment[], showPrimaryAction?: boolean, isMedical?: boolean }) {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState<string>('09:00')
    const [feedback, setFeedback] = useState<FeedbackState>(null)
    const [pendingCancelId, setPendingCancelId] = useState<string | null>(null)
    const [isCancellingId, setIsCancellingId] = useState<string | null>(null)

    const d = new Date(`${date}T12:00:00`)
    const displayMonth = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    const displayDay = d.toLocaleString('pt-BR', { weekday: 'long', day: 'numeric' })

    const navigate = (offset: number) => { const next = new Date(d); next.setDate(next.getDate() + offset); router.push(`?date=${next.toISOString().split('T')[0]}`, { scroll: false }) }
    const navigateMonth = (offset: number) => { const next = new Date(d); next.setMonth(next.getMonth() + offset); router.push(`?date=${next.toISOString().split('T')[0]}`, { scroll: false }) }
    const openSlot = (hour: number) => { setSelectedSlot(`${hour.toString().padStart(2, '0')}:00`); setIsModalOpen(true) }
    const showFeedback = (variant: NonNullable<FeedbackState>['variant'], title: string, message: string) => setFeedback({ variant, title, message })

    const handleCancelClick = async (appointmentId: string) => {
        if (pendingCancelId !== appointmentId) { setPendingCancelId(appointmentId); showFeedback('info', 'Confirme o cancelamento', 'Clique novamente no ícone vermelho para confirmar.'); return }
        setIsCancellingId(appointmentId); setFeedback(null)
        const result = await cancelAppointment(appointmentId); setIsCancellingId(null)
        if (result?.error) { showFeedback('error', 'Não foi possível cancelar', result.error); return }
        setPendingCancelId(null); showFeedback('success', 'Agendamento cancelado', 'O horário foi liberado com sucesso.'); router.refresh()
    }

    const hours = Array.from({ length: 14 }, (_, i) => i + 7)

    return (
        <div>
            {feedback && <FeedbackBanner variant={feedback.variant} title={feedback.title} message={feedback.message} className="mb-4" />}
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Agenda diária</p><h3 className="mt-1 text-xl font-bold capitalize tracking-tight text-slate-900">{displayDay}</h3></div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-1 shadow-sm"><button onClick={() => navigateMonth(-1)} aria-label="Mês anterior" className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900"><ArrowLeft size={15} /></button><span className="min-w-[125px] px-3 text-center text-xs font-semibold capitalize text-slate-600">{displayMonth}</span><button onClick={() => navigateMonth(1)} aria-label="Próximo mês" className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900"><ArrowRight size={15} /></button></div>
                    <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm"><button onClick={() => navigate(-1)} aria-label="Dia anterior" className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900"><ChevronLeft size={17} /></button><span className="px-3 text-xs font-semibold text-slate-600">Dia</span><button onClick={() => navigate(1)} aria-label="Próximo dia" className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900"><ChevronRight size={17} /></button></div>
                    {showPrimaryAction && <button onClick={() => setIsModalOpen(true)} className="ui-btn ui-btn-primary h-10 px-4 text-xs"><Plus size={16} /> Novo agendamento</button>}
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {hours.map((hour) => {
                    const time = `${hour.toString().padStart(2, '0')}:00`
                    const appointmentsInSlot = appointments.filter((appointment) => Number(appointment.startTime.split(':')[0]) === hour)
                    const isLunch = hour === 12 && appointmentsInSlot.length === 0
                    return (
                        <div key={hour} className="group flex min-h-[76px] border-b border-slate-100 last:border-b-0">
                            <div className="w-[68px] shrink-0 border-r border-slate-100 bg-slate-50/60 px-2 pt-4 text-center sm:w-[82px]"><span className="text-xs font-medium tabular-nums text-slate-400 group-hover:text-slate-600">{time}</span></div>
                            <div className="relative flex min-w-0 flex-1 items-center p-2.5 sm:p-3">
                                {isLunch ? <div className="w-full text-center text-[10px] font-medium uppercase tracking-wider text-slate-300">Pausa para almoço</div> : appointmentsInSlot.length > 0 ? (
                                    <div className="flex w-full flex-col gap-2">
                                        {appointmentsInSlot.map((appointment) => (
                                            <div key={appointment.id} className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-slate-300 hover:shadow">
                                                <div className="hidden h-8 w-1 shrink-0 rounded-full bg-indigo-500 sm:block" aria-hidden="true" />
                                                <div className="flex min-w-0 flex-1 items-center gap-2.5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Clock size={16} /></div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{appointment.clientName}</p><div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">{appointment.eventType?.name && <span className="truncate font-medium text-indigo-600">{appointment.eventType.name}</span>}<span className="tabular-nums">{appointment.startTime}–{appointment.endTime}</span></div></div></div>
                                                <div className="flex shrink-0 items-center gap-1.5">
                                                    {isMedical && appointment.clientId && <Link href={`/clients/${appointment.clientId}/encounters/new`} aria-label={`Atender ${appointment.clientName}`} title="Registrar atendimento" className="flex h-8 items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-100"><Stethoscope size={14} /> <span className="hidden sm:inline">Atender</span></Link>}
                                                    {appointment.clientPhone && <a href={`https://wa.me/${appointment.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${appointment.clientName}, aqui é da equipe do Schedly. Gostaria de confirmar seu agendamento de ${appointment.eventType?.name || 'serviço'} para hoje às ${appointment.startTime}. Nos vemos lá!` )}`} target="_blank" rel="noopener noreferrer" aria-label={`Enviar WhatsApp para ${appointment.clientName}`} className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100" title="Enviar WhatsApp"><MessageCircle size={16} /></a>}
                                                    <button onClick={() => handleCancelClick(appointment.id)} disabled={isCancellingId === appointment.id} aria-label={pendingCancelId === appointment.id ? `Confirmar cancelamento de ${appointment.clientName}` : `Cancelar agendamento de ${appointment.clientName}`} className={`flex h-8 w-8 items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-50 ${pendingCancelId === appointment.id ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`} title={pendingCancelId === appointment.id ? 'Confirmar cancelamento' : 'Cancelar agendamento'}><X size={15} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <button onClick={() => openSlot(hour)} className="flex h-10 w-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs font-medium text-slate-400 opacity-0 transition group-hover:opacity-100 hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"><Plus size={14} className="mr-1.5" /> Abrir horário</button>}
                            </div>
                        </div>
                    )
                })}
            </div>
            {appointments.length === 0 && <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400"><Calendar size={14} /> Nenhum agendamento neste dia. Passe o mouse sobre um horário para adicionar.</div>}
            {isModalOpen && <BookingModal date={date} startTime={selectedSlot} onClose={() => setIsModalOpen(false)} />}
        </div>
    )
}