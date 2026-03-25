import { verifySession } from '@/lib/auth';
import { ClientService } from '@/services/clientService';
import { redirect } from 'next/navigation';
import { Search, UserPlus, Filter, MoreHorizontal, Users, UserCheck, TrendingUp, MessageCircle, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string }> }) {
    const session = await verifySession();
    if (!session) redirect('/login');

    const resolvedParams = await searchParams;
    const query = resolvedParams.q || '';
    const page = parseInt(resolvedParams.page || '1');

    const { clients, pagination } = await ClientService.listClients(session.userId as string, {
        query,
        page,
        pageSize: 10
    });

    // Real Metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [activeClientsCount, allAppts] = await prisma.$transaction([
        prisma.client.count({
            where: {
                appointments: {
                    some: {
                        userId: session.userId as string,
                        date: { gte: thirtyDaysAgo },
                        status: 'SCHEDULED'
                    }
                }
            }
        }),
        prisma.appointment.findMany({
            where: { userId: session.userId as string, status: 'SCHEDULED' },
            select: { eventType: { select: { price: true } } }
        })
    ]);

    const totalRevenue = allAppts.reduce((acc, app) => acc + (Number(app.eventType?.price) || 0), 0);
    const avgTicket = pagination.total > 0 ? totalRevenue / pagination.total : 0;

    const stats = [
        { label: 'Total de Clientes', value: pagination.total, icon: Users, color: 'text-primary', bg: 'bg-indigo-50' },
        { label: 'Ativos (30 dias)', value: activeClientsCount, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Ticket Médio', value: `R$ ${avgTicket.toFixed(2)}`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    return (
        <div className="p-6 sm:p-10 max-w-7xl mx-auto animate-in fade-in duration-1000">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.25em]">Gestão de Audiência</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Meus Clientes</h1>
                    <p className="text-slate-400 font-medium text-lg mt-3">Visualize o histórico e gerencie o relacionamento com seus clientes.</p>
                </div>
                
                <button className="h-14 px-10 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
                    <UserPlus size={18} />
                    Novo Cliente
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-900 m-0 leading-none tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-10">
                <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row gap-6 bg-slate-50/30">
                    <form className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            name="q"
                            defaultValue={query}
                            placeholder="Buscar por nome, e-mail ou telefone..."
                            className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white border border-slate-200 font-bold text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300"
                        />
                    </form>
                    <button className="h-14 px-8 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 transition-all shadow-sm flex items-center gap-3">
                        <Filter size={18} />
                        Filtrar
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Cliente</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Agendamentos</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Status</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Faturamento</th>
                                <th className="p-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <Users size={40} className="mx-auto mb-4 text-slate-200" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Nenhum cliente cadastrado ainda</p>
                                    </td>
                                </tr>
                            ) : (
                                clients.map(client => (
                                    <tr key={client.id} className="group hover:bg-primary/[0.02] transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-lg group-hover:bg-primary group-hover:text-white transition-all">
                                                    {client.name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 leading-none mb-1 text-base">{client.name}</div>
                                                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold uppercase tracking-tighter leading-none">
                                                        <span className="flex items-center gap-1"><Mail size={10} /> {client.email}</span>
                                                        {client.phone && <span className="flex items-center gap-1"><MessageCircle size={10} /> {client.phone}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="text-lg font-black text-slate-700">{client.totalAppointments}</span>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest -mt-1">Sessões</p>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${client.cancelRate > 20 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${client.cancelRate > 20 ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                                {client.cancelRate > 20 ? 'Risco Churn' : 'Fiel'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="font-black text-primary text-xl tracking-tighter">R$ {client.totalRevenue.toFixed(2)}</div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest -mt-1">Valor Vitalício</p>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {client.phone && (
                                                    <a 
                                                        href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                        title="WhatsApp"
                                                    >
                                                        <MessageCircle size={18} />
                                                    </a>
                                                )}
                                                <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination UI */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                    <div className="h-[1px] w-20 bg-slate-100"></div>
                    <div className="flex gap-2">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                            <Link
                                key={p}
                                href={`?q=${query}&page=${p}`}
                                className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-xs transition-all border ${p === page ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-110' : 'bg-white text-slate-400 border-slate-100 hover:border-primary/20 hover:text-primary shadow-sm'}`}
                            >
                                {p}
                            </Link>
                        ))}
                    </div>
                    <div className="h-[1px] w-20 bg-slate-100"></div>
                </div>
            )}
        </div>
    );
}
