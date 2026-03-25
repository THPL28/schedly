import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminActions from './admin-actions'
import { Users, CalendarCheck, ShieldCheck, Mail, Zap, Settings, ArrowRight, Clock, Star, Sparkles, TrendingUp } from 'lucide-react'

export default async function AdminPage() {
    const session = await verifySession()
    if (!session) redirect('/login')

    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        select: { role: true }
    })

    // Role check
    if (user?.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner shadow-red-500/10">
                    <ShieldCheck size={48} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Acesso Restrito</h1>
                <p className="text-slate-500 max-w-sm font-medium leading-relaxed">Área de segurança máxima reservada exclusivamente para administradores do ecossistema Schedly.</p>
                <a 
                  href="/dashboard" 
                  className="mt-10 btn btn-primary px-10 h-14 rounded-[1.5rem] shadow-2xl shadow-primary/30 font-black uppercase tracking-widest text-sm"
                >
                  Voltar ao Início
                </a>
            </div>
        )
    }

    const users = await prisma.user.findMany({
        include: {
            subscription: { include: { plan: true } },
            _count: { select: { appointments: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    const totalUsers = users.length
    const totalAppointments = await prisma.appointment.count()
    const activeSubs = users.filter(u => u.subscription?.status === 'ACTIVE').length
    const trials = users.filter(u => u.subscription?.status === 'TRIAL').length

    return (
        <div className="p-6 sm:p-12 max-w-[1500px] mx-auto animate-in fade-in duration-1000">
            {/* Premium Header Banner */}
            <div className="relative bg-slate-900 rounded-[3rem] p-10 sm:p-16 mb-16 overflow-hidden shadow-2xl shadow-slate-900/30">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] -ml-40 -mb-40"></div>
                
                <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
                    <div className="text-center xl:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white mb-8">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Admin Core Engine v1.50</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter leading-none mb-6">Central de <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Controle</span></h1>
                        <p className="text-slate-400 text-lg sm:text-xl font-medium max-w-2xl leading-relaxed">Gerencie toda a infraestrutura, usuários e fluxos financeiros do ecossistema Schedly em tempo real.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full xl:w-auto">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] text-center flex flex-col items-center gap-4 hover:bg-white/10 transition-all duration-500 group">
                            <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Total Usuários</p>
                                <p className="text-3xl font-black text-white m-0 tracking-tight leading-none">{totalUsers}</p>
                            </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] text-center flex flex-col items-center gap-4 hover:bg-white/10 transition-all duration-500 group">
                            <div className="w-14 h-14 rounded-2xl bg-success/20 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CalendarCheck size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Agendamentos</p>
                                <p className="text-3xl font-black text-white m-0 tracking-tight leading-none">{totalAppointments}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {[
                    { label: 'Assinaturas Ativas', value: activeSubs, icon: Zap, color: 'text-success', bg: 'bg-success/10' },
                    { label: 'Em Período Trial', value: trials, icon: Clock, color: 'text-secondary', bg: 'bg-secondary/10' },
                    { label: 'Crescimento Mês', value: '+12.4%', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Status Sistema', value: 'Online', icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 shadow-sm hover:shadow-xl hover:translate-y-[-5px] transition-all duration-500 group">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform`}>
                            <stat.icon size={26} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 m-0 leading-none tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Users Table Table */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-slate-50 to-transparent opacity-50 pointer-events-none"></div>

                <div className="px-10 py-10 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Membros Schedly</h3>
                            <p className="text-xs text-slate-400 font-bold flex items-center gap-2 uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
                                Gestão Ativa de Base de Dados
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <input 
                                type="text" 
                                placeholder="Buscar usuários..." 
                                className="h-12 w-64 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <button className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-primary transition-colors shadow-lg shadow-slate-900/10">
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto p-4 sm:p-8">
                    <table className="w-full border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="text-left border-b border-slate-100">
                                <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identidade</th>
                                <th className="py-6 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível de Acesso</th>
                                <th className="py-6 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assinatura / Plano</th>
                                <th className="py-6 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Atividade</th>
                                <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações Rápidas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map(u => (
                                <tr key={u.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                    <td className="py-8 px-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-xl shadow-slate-200 border border-slate-100 flex items-center justify-center text-xl font-black text-primary overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                                {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" /> : u.name?.[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-base font-black text-slate-900 truncate tracking-tight">{u.name}</div>
                                                <div className="text-xs text-slate-400 font-bold truncate flex items-center gap-2 mt-1">
                                                    <Mail size={12} className="shrink-0 text-slate-300" />
                                                    {u.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-6">
                                        <div className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm ${u.role === 'ADMIN' ? 'bg-primary text-white shadow-primary/20' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                            <ShieldCheck size={14} className={u.role === 'ADMIN' ? 'animate-pulse' : ''} />
                                            {u.role}
                                        </div>
                                    </td>
                                    <td className="py-8 px-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] border-2 shadow-sm ${
                                                    u.subscription?.status === 'ACTIVE' 
                                                    ? 'bg-success/5 text-success border-success/20 shadow-success/5' 
                                                    : u.subscription?.status === 'TRIAL' 
                                                        ? 'bg-secondary/5 text-secondary border-secondary/20 shadow-secondary/5' 
                                                        : 'bg-slate-100 text-slate-400 border-slate-200'
                                                }`}>
                                                    {u.subscription?.status || 'FREE USER'}
                                                </span>
                                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{u.subscription?.plan?.name || ''}</span>
                                            </div>
                                            {u.subscription?.status === 'TRIAL' && (
                                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                <Clock size={12} className="text-slate-300" />
                                                Expira em {u.subscription?.trialEndDate ? new Date(u.subscription.trialEndDate).toLocaleDateString('pt-BR') : '-'}
                                              </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-8 px-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">{u._count.appointments}</div>
                                            <div className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">Agendamentos</div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10 text-right">
                                        <div className="flex justify-end gap-2 translate-x-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                          <AdminActions userId={u.id} subscription={u.subscription} userRole={u.role} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
