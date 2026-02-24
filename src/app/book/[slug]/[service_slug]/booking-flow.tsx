'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay, isToday, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react';
import { bookAppointmentPublic } from '@/lib/actions';
import { useSearchParams } from 'next/navigation';

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
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const res = await fetch(`/api/availability/${user.id}?date=${dateStr}&duration=${eventType.duration}&buffer=${eventType.bufferTime}`);
            const data = await res.json();
            setAvailableSlots(data.slots || []);
        } catch (error) {
            console.error('Error fetching slots:', error);
        } finally {
            setLoadingSlots(false);
        }
    }

    async function handleBooking(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedDate || !selectedSlot) return;

        setIsBooking(true);
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
            window.alert(res.error || 'Erro ao agendar.');
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

                <button
                    onClick={() => window.location.href = `/book/${user.slug}`}
                    className="btn btn-primary h-14 px-10 shadow-lg shadow-primary/20"
                >
                    Concluído
                </button>
            </div>
        );
    }

    return (
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
    );
}
