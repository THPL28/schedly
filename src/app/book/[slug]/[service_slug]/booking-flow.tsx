'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay, isToday, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react';
import { bookAppointmentPublic } from '@/lib/actions';
import { useSearchParams } from 'next/navigation';
import FeedbackBanner from '@/components/feedback-banner';

type FeedbackState = {
    variant: 'success' | 'error' | 'info';
    title: string;
    message: string;
} | null;

export default function ServiceBookingFlow({ user, eventType }: { user: any, eventType: any }) {
    const searchParams = useSearchParams();
    const rescheduleToken = searchParams.get('reschedule');

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<{ start: string, end: string } | null>(null);
    const [availableSlots, setAvailableSlots] = useState<{ start: string, end: string }[]>([]);
    const [step, setStep] = useState(1); // 1: Date/Time, 2: Form, 3: Success
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackState>(null);

    // Form state
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        notes: ''
    });

    useEffect(() => {
        if (rescheduleToken) {
            // In a real app, you might fetch the old appointment details here
            // For now, we'll just keep the token to pass it along
        }
    }, [rescheduleToken]);

    const showFeedback = (
        variant: NonNullable<FeedbackState>['variant'],
        title: string,
        message: string
    ) => {
        setFeedback({ variant, title, message });
    };

    // Calendar logic
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    // Padding for month grid
    const startDay = daysInMonth[0].getDay();
    const padding = Array.from({ length: startDay }, (_, i) => null);

    useEffect(() => {
        if (selectedDate) {
            fetchSlots(selectedDate);
        }
    }, [selectedDate]);

    async function fetchSlots(date: Date) {
        setLoadingSlots(true);
        setSelectedSlot(null);
        setFeedback(null);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const res = await fetch(`/api/availability/${user.id}?date=${dateStr}&duration=${eventType.duration}&buffer=${eventType.bufferTime}`);
            const data = await res.json();
            setAvailableSlots(data.slots || []);
        } catch (error) {
            console.error('Error fetching slots:', error);
            showFeedback(
                'error',
                'Não foi possível carregar os horários',
                'Tivemos um problema ao buscar os horários disponíveis. Tente novamente em alguns instantes.'
            );
        } finally {
            setLoadingSlots(false);
        }
    }

    async function handleBooking(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedDate || !selectedSlot) return;

        setIsBooking(true);
        setFeedback(null);
        const form = new FormData();
        form.append('providerId', user.id);
        form.append('eventTypeId', eventType.id);
        form.append('date', format(selectedDate, 'yyyy-MM-dd'));
        form.append('startTime', selectedSlot.start);
        form.append('endTime', selectedSlot.end);
        form.append('clientName', formData.clientName);
        form.append('clientEmail', formData.clientEmail);
        form.append('clientPhone', formData.clientPhone);
        form.append('notes', formData.notes);
        if (rescheduleToken) {
            form.append('rescheduleToken', rescheduleToken);
        }

        const res = await bookAppointmentPublic(form);
        if (res.success) {
            setStep(3);
        } else {
            showFeedback(
                'error',
                'Não foi possível concluir o agendamento',
                res.error || 'Tivemos um problema ao finalizar o agendamento. Tente novamente.'
            );
        }
        setIsBooking(false);
    }

    if (step === 3) {
        return (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[550px] animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
                    <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-2">{rescheduleToken ? 'Reagendado!' : 'Agendado!'}</h2>
                <p className="text-slate-500 mb-10 max-w-sm font-medium">Tudo pronto! Enviamos os detalhes para <strong>{formData.clientEmail}</strong>.</p>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 w-full max-w-md text-left mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: eventType.color }}></div>
                        <h4 className="font-black text-xl text-slate-800 m-0">{eventType.name}</h4>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                            <Clock size={16} className="text-primary" /> {eventType.duration} minutos
                        </div>
                        <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/10 text-primary font-black text-lg">
                            {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })} às {selectedSlot?.start}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
                    <button
                        onClick={() => window.location.href = `/book/${user.slug}`}
                        className="flex-1 h-14 px-10 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Concluído
                    </button>
                    
                    {user.phone && (
                        <a 
                            href={`https://wa.me/${user.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Acabei de realizar um agendamento para o serviço ${eventType.name} no dia ${format(selectedDate!, "d 'de' MMMM", { locale: ptBR })} às ${selectedSlot?.start}. Poderia confirmar?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-3 h-14 px-10 rounded-2xl bg-[#25D366] text-white font-black uppercase tracking-widest text-[11px] hover:bg-[#128C7E] transition-all shadow-xl shadow-[#25D366]/20 no-underline"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48">
                                <path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6	C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z"></path>
                                <path fill="#fff" d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6	C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3	L5,43.8C5,43.8,4.9,43.8,4.9,43.8z"></path>
                                <path fill="#cfd8dc" d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3	L4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24	c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2	c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z"></path>
                                <path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8	l6-1.6l0.6,0.3c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z"></path>
                                <path fill="#fff" fill-rule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0	s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3	c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9	c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8	c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8C20.6,19.3,19.7,17,19.3,16z" clip-rule="evenodd"></path>
                            </svg>
                            Confirmar via WhatsApp
                        </a>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {feedback && (
                <FeedbackBanner
                    variant={feedback.variant}
                    title={feedback.title}
                    message={feedback.message}
                    className="animate-in fade-in slide-in-from-top-2"
                />
            )}

            <div className="flex flex-col md:flex-row h-full">
                {step === 1 ? (
                    <>
                    {/* Calendar Selection */}
                    <div className="flex-1 p-10 border-r border-slate-50">
                        {rescheduleToken && (
                            <div className="mb-8 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-3 text-primary text-xs font-black uppercase tracking-wider">
                                <AlertCircle size={16} /> Reagendamento em curso
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black text-slate-900">Selecione uma Data</h3>
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all border border-slate-100">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all border border-slate-100">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="mb-6 text-center font-black text-slate-900 uppercase tracking-[0.2em] text-xs">
                            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                        </div>

                        <div className="grid grid-cols-7 mb-4">
                            {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map(d => (
                                <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase p-2">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1.5">
                            {padding.map((_, i) => <div key={`pad-${i}`} />)}
                            {daysInMonth.map(day => {
                                const isPast = isBefore(day, startOfDay(new Date()));
                                const isSelected = selectedDate && isSameDay(day, selectedDate);
                                return (
                                    <button
                                        key={day.toISOString()}
                                        disabled={isPast}
                                        onClick={() => setSelectedDate(day)}
                                        className={`
                                        aspect-square flex flex-col items-center justify-center rounded-2xl text-sm font-black transition-all relative
                                        ${isPast ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}
                                        ${isSelected ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primary hover:text-white' : ''}
                                        ${isToday(day) && !isSelected ? 'after:content-[""] after:absolute after:bottom-2 after:w-1 after:h-1 after:bg-primary after:rounded-full' : ''}
                                      `}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div className="w-full md:w-[320px] p-10 bg-[#fdfdfd] flex flex-col shrink-0">
                        <h3 className="text-xl font-black text-slate-900 mb-8">Horários</h3>
                        {selectedDate ? (
                            <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                                {loadingSlots ? (
                                    <div className="flex flex-col items-center justify-center py-24 text-slate-300 gap-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Buscando vagas...</span>
                                    </div>
                                ) : availableSlots.length > 0 ? (
                                    availableSlots.map(slot => (
                                        <button
                                            key={slot.start}
                                            onClick={() => {
                                                setSelectedSlot(slot);
                                                setStep(2);
                                            }}
                                            className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-black text-primary hover:border-primary hover:bg-primary/5 transition-all text-base shadow-sm hover:shadow-md active:scale-[0.98]"
                                        >
                                            {slot.start}
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-24 text-slate-400 text-sm font-medium italic px-6">Puxa, nenhum horário livre nesta data.</div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-24 text-slate-300 text-sm font-medium italic border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center gap-4">
                                <CalendarDays size={32} />
                                <span>Escolha um dia no calendário</span>
                            </div>
                        )}
                    </div>
                    </>
                ) : (
                    <div className="flex-1 p-10 md:p-14 animate-in slide-in-from-right-8 duration-500">
                        <button onClick={() => setStep(1)} className="text-slate-400 hover:text-primary mb-12 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all no-underline hover:translate-x-[-4px]">
                        ← Alterar Horário
                    </button>

                    <div className="mb-12">
                        <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">Seus Detalhes</h2>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-lg">
                                {format(selectedDate!, "EEEE, d 'de' MMMM", { locale: ptBR })}
                            </div>
                            <div className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-black rounded-lg">
                                às {selectedSlot?.start}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleBooking} className="space-y-6 max-w-[480px]">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu Nome Completo</label>
                            <input
                                required
                                className="input h-14 text-base"
                                value={formData.clientName}
                                onChange={e => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                                placeholder="Como você se chama?"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                                <input
                                    required
                                    type="email"
                                    className="input h-14 text-base"
                                    value={formData.clientEmail}
                                    onChange={e => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                                    placeholder="ex@email.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                                <input
                                    className="input h-14 text-base"
                                    value={formData.clientPhone}
                                    onChange={e => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notas ou Observações</label>
                            <textarea
                                className="input min-h-[120px] py-4"
                                value={formData.notes}
                                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Algo importante para o profissional saber?"
                            ></textarea>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isBooking}
                                className="btn btn-primary w-full h-16 text-lg font-black shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                            >
                                {isBooking ? 'Finalizando...' : rescheduleToken ? 'Confirmar Reagendamento' : 'Confirmar Agendamento'}
                            </button>
                        </div>
                    </form>
                    </div>
                )}
            </div>
        </div>
    );
}
