import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ServiceBookingFlow from './booking-flow';
import { ChevronLeft, Clock, Tag, Globe, User } from 'lucide-react';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function BookingServicePage({ params }: { params: Promise<{ slug: string, service_slug: string }> }) {
    const { slug, service_slug } = await params;

    const user = await prisma.user.findUnique({
        where: { slug },
        include: {
            subscription: {
                include: { plan: true }
            }
        }
    });

    if (!user) notFound();

    const eventType = await prisma.eventType.findFirst({
        where: { userId: user.id, slug: service_slug, isActive: true }
    });

    if (!eventType) notFound();

    const serializedUser = {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        subscription: user.subscription ? {
            ...user.subscription,
            startDate: user.subscription.startDate.toISOString(),
            trialEndDate: user.subscription.trialEndDate?.toISOString(),
            currentPeriodEnd: user.subscription.currentPeriodEnd?.toISOString(),
            updatedAt: user.subscription.updatedAt.toISOString(),
        } : null
    };

    const serializedEventType = {
        ...eventType,
        price: eventType.price ? Number(eventType.price) : null,
        createdAt: eventType.createdAt.toISOString(),
        updatedAt: eventType.updatedAt.toISOString(),
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 py-8 md:py-20 font-sans">
            <div className="w-full max-w-[1020px] bg-white rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.06)] overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[640px]">
                {/* Visual Sidebar Info */}
                <div className="w-full md:w-[380px] p-10 bg-[#fafafa] border-b md:border-b-0 md:border-r border-slate-100 flex flex-col shrink-0">
                    <Link
                        href={`/book/${user.slug}`}
                        className="text-slate-400 hover:text-primary mb-12 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors no-underline transition-all hover:translate-x-[-4px]"
                    >
                        <ChevronLeft size={16} /> Voltar para serviços
                    </Link>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            {(() => {
                                const canShowLogo = user.subscription?.status === 'TRIAL' || user.subscription?.plan?.name === 'Pro';

                                return (
                                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary border border-slate-50 overflow-hidden">
                                        {(user.avatarUrl && canShowLogo) ? (
                                            <img src={user.avatarUrl} alt={user.name || ''} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                );
                            })()}
                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{user.name}</span>
                        </div>

                        <h1 className="text-3xl font-black text-slate-900 leading-tight mb-8">{eventType.name}</h1>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-slate-600">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                    <Clock size={16} />
                                </div>
                                <span className="font-bold text-sm tracking-tight">{eventType.duration} minutos</span>
                            </div>

                            {eventType.price && (
                                <div className="flex items-center gap-4 text-slate-600">
                                    <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                                        <Tag size={16} />
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">R$ {Number(eventType.price).toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-slate-600">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                    <Globe size={16} />
                                </div>
                                <span className="font-bold text-sm tracking-tight">Horário de Brasília (GMT-3)</span>
                            </div>
                        </div>

                        {eventType.description && (
                            <div className="mt-10 pt-10 border-t border-slate-100">
                                <p className="text-slate-500 text-sm leading-relaxed font-medium italic">
                                    {eventType.description}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto hidden md:block pt-12">
                        <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">Schedlyfy Premium</p>
                    </div>
                </div>

                {/* Main Booking Flow Area */}
                <div className="flex-1 overflow-auto bg-white">
                    <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                        <ServiceBookingFlow
                            user={serializedUser as any}
                            eventType={serializedEventType as any}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
