import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, MessageSquare, XCircle, RefreshCw } from 'lucide-react';
import { cancelAppointmentPublic } from '@/lib/actions';

export default async function AppointmentManagementPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    const appointment = await prisma.appointment.findUnique({
        where: { cancelToken: token },
        include: {
            user: { select: { name: true, slug: true } },
            eventType: { select: { name: true, duration: true } }
        }
    });

    if (!appointment) notFound();

    async function handleCancel() {
        'use server';
        await cancelAppointmentPublic(token);
    }

    const isCanceled = appointment.status === 'CANCELED';

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black mb-2">Gerenciar Agendamento</h1>
                    <p className="text-muted text-sm">Visualize ou altere os detalhes do seu compromisso.</p>
                </div>

                <div className="card p-8 relative overflow-hidden">
                    {isCanceled && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-4">
                                <XCircle size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-danger mb-2">Agendamento Cancelado</h2>
                            <p className="text-muted text-sm mb-6">Este compromisso foi cancelado e não está mais ativo.</p>
                            <a href={`/book/${appointment.user.slug}`} className="btn btn-primary w-full">Agendar novamente</a>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Data e Horário</p>
                                <p className="font-bold text-lg text-foreground">
                                    {format(appointment.date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                                </p>
                                <p className="text-muted font-medium">
                                    {appointment.startTime} — {appointment.endTime} ({appointment.eventType?.duration} min)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Serviço</p>
                                <p className="font-bold text-lg text-foreground">{appointment.eventType?.name || 'Serviço Personalizado'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Profissional</p>
                                <p className="font-bold text-lg text-foreground">{appointment.user.name}</p>
                            </div>
                        </div>

                        {appointment.notes && (
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Suas Notas</p>
                                    <p className="text-sm text-muted italic">"{appointment.notes}"</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {!isCanceled && (
                        <div className="mt-10 pt-8 border-t border-border grid grid-cols-2 gap-4">
                            <form action={handleCancel}>
                                <button type="submit" className="btn btn-outline w-full text-danger border-danger/20 hover:bg-danger/5 py-4 font-bold flex flex-col items-center gap-1 h-auto">
                                    <XCircle size={18} />
                                    <span className="text-[10px] uppercase">Cancelar</span>
                                </button>
                            </form>
                            <a href={`/book/${appointment.user.slug}/${appointment.eventTypeId || ''}?reschedule=${token}`} className="btn btn-outline w-full py-4 font-bold flex flex-col items-center gap-1 h-auto">
                                <RefreshCw size={18} />
                                <span className="text-[10px] uppercase">Reagendar</span>
                            </a>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[11px] text-muted font-medium">Schedlyfy — Agendamento Profissional Simplificado</p>
                </div>
            </div>
        </div>
    );
}
