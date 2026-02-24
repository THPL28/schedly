import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, Tag, ChevronRight, Globe, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    console.log('[DEBUG] Booking Page - Slug received:', resolvedParams.slug);

    const user = await prisma.user.findUnique({
        where: { slug: resolvedParams.slug },
        include: {
            eventTypes: {
                where: { isActive: true },
                orderBy: { duration: 'asc' }
            },
            subscription: {
                include: { plan: true }
            }
        }
    });

    console.log('[DEBUG] Booking Page - User found:', user ? user.name : 'NOT FOUND');

    if (!user) notFound();

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center p-4 py-8 md:py-20 font-sans">
            <div className="w-full max-w-[820px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
                    {/* Sidebar / Profile Info */}
                    <div className="p-8 md:p-10 bg-[#fafafa] border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center md:items-start text-center md:text-left">
                        {/* Logo / Avatar constraint logic */}
                        {(() => {
                            const canShowLogo = user.subscription?.status === 'TRIAL' || user.subscription?.plan?.name === 'Pro';

                            return (
                                <div className="w-24 h-24 bg-white rounded-3xl shadow-lg p-1 mb-8 flex items-center justify-center overflow-hidden">
                                    {(user.avatarUrl && canShowLogo) ? (
                                        <img src={user.avatarUrl} alt={user.name || ''} className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-400">
                                            {user.name?.[0]}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        <div className="space-y-4">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-tight">{user.name}</h1>
                                <div className="flex items-center justify-center md:justify-start gap-1.5 mt-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                    <ShieldCheck size={12} />
                                    <span>Profissional Verificado</span>
                                </div>
                            </div>

                            <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                {user.bio || 'Bem-vindo à minha página de agendamentos. Selecione um serviço ao lado para escolher o melhor horário para você.'}
                            </p>
                        </div>

                        <div className="mt-auto pt-10 hidden md:block w-full">
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                                <Globe size={12} />
                                <span>Fusos Horários Automáticos</span>
                            </div>
                        </div>
                    </div>

                    {/* Service Selection */}
                    <div className="p-8 md:p-12">
                        <div className="mb-8">
                            <h2 className="text-lg font-black text-slate-900 mb-2">Serviços Disponíveis</h2>
                            <p className="text-sm text-slate-400 font-medium">Qual desses serviços você deseja agendar hoje?</p>
                        </div>

                        <div className="space-y-4">
                            {user.eventTypes.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium italic text-sm">Nenhum serviço disponível no momento.</p>
                                </div>
                            ) : (
                                user.eventTypes.map(type => (
                                    <Link
                                        key={type.id}
                                        href={`/book/${user.slug}/${type.slug}`}
                                        className="group flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-xl hover:shadow-primary/5 transition-all text-decoration-none ring-0 active:scale-[0.98]"
                                    >
                                        <div className="flex gap-5 items-center">
                                            <div className="w-1.5 h-12 rounded-full hidden sm:block" style={{ backgroundColor: type.color }}></div>
                                            <div>
                                                <h3 className="text-base font-black text-slate-900 group-hover:text-primary transition-colors m-0 leading-tight">
                                                    {type.name}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-400">
                                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                                                        <Clock size={12} className="text-slate-400" />
                                                        {type.duration} min
                                                    </span>
                                                    {type.price && (
                                                        <span className="text-slate-700">
                                                            R$ {Number(type.price).toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                                            <ChevronRight size={16} />
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        <div className="mt-12 text-center">
                            <p className="text-[10px] text-slate-300 uppercase tracking-[0.2em] font-black">
                                Powered by <span className="text-slate-400">Schedlyfy</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
