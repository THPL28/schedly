import { verifySession } from '@/lib/auth';
import { ClientService } from '@/services/clientService';
import { redirect } from 'next/navigation';
import { Search, UserPlus, Filter, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

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

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black">Meus Clientes</h1>
                    <p className="text-muted text-sm font-medium">Gerencie sua base de clientes e histórico de atendimentos.</p>
                </div>
                <button className="btn btn-primary">
                    <UserPlus size={18} />
                    Novo Cliente
                </button>
            </div>

            <div className="card p-0 overflow-hidden mb-6">
                <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
                    <form className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            name="q"
                            defaultValue={query}
                            placeholder="Buscar por nome ou email..."
                            className="input pl-10 h-10"
                        />
                    </form>
                    <button className="btn btn-outline h-10">
                        <Filter size={18} />
                        Filtros
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="p-4 text-xs font-black uppercase text-muted tracking-widest">Cliente</th>
                                <th className="p-4 text-xs font-black uppercase text-muted tracking-widest">Agendamentos</th>
                                <th className="p-4 text-xs font-black uppercase text-muted tracking-widest">Cancelamentos</th>
                                <th className="p-4 text-xs font-black uppercase text-muted tracking-widest">Rec. Total</th>
                                <th className="p-4 text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-muted font-medium italic">
                                        Nenhum cliente encontrado.
                                    </td>
                                </tr>
                            ) : (
                                clients.map(client => (
                                    <tr key={client.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900">{client.name}</div>
                                            <div className="text-xs text-muted leading-none mt-1">{client.email}</div>
                                        </td>
                                        <td className="p-4 font-black text-slate-700">{client.totalAppointments}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${client.cancelRate > 20 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                                {client.cancelRate}%
                                            </span>
                                        </td>
                                        <td className="p-4 font-black text-primary">R$ {client.totalRevenue.toFixed(2)}</td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 text-muted hover:text-primary transition-colors">
                                                <MoreHorizontal size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                        <Link
                            key={p}
                            href={`?q=${query}&page=${p}`}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all border ${p === page ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-muted border-border hover:border-primary/20'}`}
                        >
                            {p}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
