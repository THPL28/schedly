import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, Tag, ChevronRight, Globe, ShieldCheck, MessageCircle } from 'lucide-react';
import { getPlanLimit } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    console.log('[DEBUG] Booking Page - Slug received:', resolvedParams.slug);

    const user = await prisma.user.findFirst({
        where: {
            slug: {
                equals: resolvedParams.slug,
                mode: 'insensitive'
            }
        },
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

    console.log('[DEBUG] Booking Page:', {
        slug: resolvedParams.slug,
        userFound: !!user,
        userName: user?.name,
        eventTypesCount: user?.eventTypes.length,
        subscriptionStatus: user?.subscription?.status
    });

    if (!user) {
        console.log('[DEBUG] User NOT FOUND for slug:', resolvedParams.slug);
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center p-4 py-8 md:py-20 font-sans">
            <div className="w-full max-w-[820px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
                    {/* Sidebar / Profile Info */}
                    <div className="p-8 md:p-10 bg-[#fafafa] border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center md:items-start text-center md:text-left">
                        {/* Logo / Avatar constraint logic */}
                        {(() => {
                            const whitelist = [
                                'tiago.looze28@gmail.com',
                                'thpldevweb@gmail.com',
                                'flahwagner19@gmail.com'
                            ]
                            const isWhitelisted = whitelist.includes(user.email) || user.role === 'ADMIN'
                            const plan = getPlanLimit(user.subscription);
                            const canShowLogo = isWhitelisted || plan.customBranding;

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

                        <div className="space-y-6">
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
                {user.phone && (
                <a 
                    href={`https://wa.me/${user.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-[0_15px_40px_rgba(37,211,102,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-500 z-50 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48">
                        <path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6	C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z"></path>
                        <path fill="#fff" d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6	C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3	L5,43.8C5,43.8,4.9,43.8,4.9,43.8z"></path>
                        <path fill="#cfd8dc" d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3	L4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24	c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2	c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z"></path>
                        <path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8	l6-1.6l0.6,0.3c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z"></path>
                        <path fill="#fff" fill-rule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0	s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3	c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9	c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8	c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8C20.6,19.3,19.7,17,19.3,16z" clip-rule="evenodd"></path>
                    </svg>
                </a>
            )}
        </div>
        </div>
    );
}
