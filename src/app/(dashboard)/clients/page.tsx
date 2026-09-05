import { verifySession } from '@/lib/auth'
import { ClientService } from '@/services/clientService'
import { redirect } from 'next/navigation'
import { Search, UserPlus, MoreHorizontal, Users, UserCheck, TrendingUp, MessageCircle, Mail, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string }> }) {
  const session = await verifySession()
  if (!session) redirect('/login')
  const params = await searchParams
  const query = params.q || ''
  const page = Math.max(1, parseInt(params.page || '1') || 1)
  const userId = session.userId as string
  const { clients, pagination } = await ClientService.listClients(userId, { query, page, pageSize: 10 })
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const [activeClientsCount, allAppts, profile] = await prisma.$transaction([
    prisma.client.count({ where: { appointments: { some: { userId, date: { gte: thirtyDaysAgo }, status: 'SCHEDULED' } } } }),
    prisma.appointment.findMany({ where: { userId, status: 'SCHEDULED' }, select: { eventType: { select: { price: true } } } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
  ])
  const totalRevenue = allAppts.reduce((acc, app) => acc + (Number(app.eventType?.price) || 0), 0)
  const avgTicket = pagination.total > 0 ? totalRevenue / pagination.total : 0
  const stats = [
    { label: 'Clientes', value: pagination.total, icon: Users, tone: 'bg-indigo-50 text-indigo-600' },
    { label: 'Ativos · 30 dias', value: activeClientsCount, icon: UserCheck, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Ticket médio', value: `R$ ${avgTicket.toFixed(2)}`, icon: TrendingUp, tone: 'bg-amber-50 text-amber-600' },
  ]

  return <div className="page-shell">
    <header className="page-header"><div><h1 className="page-title">{profile?.name ? `Clientes de ${profile.name.split(' ')[0]}` : 'Clientes'}</h1><p className="page-description">Abra um perfil para consultar agendamentos e, no modo Médico, o histórico clínico.</p></div><div className="page-actions"><Link href="/appointment" className="ui-btn ui-btn-primary"><UserPlus size={17} /> Novo agendamento</Link></div></header>
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="section-card flex items-center gap-3 p-4"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><Icon size={19} /></div><div><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-bold text-slate-900">{value}</p></div></div>)}</div>
    <section className="section-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5"><form className="relative flex-1" role="search"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input name="q" defaultValue={query} placeholder="Buscar por nome, e-mail ou telefone" aria-label="Buscar clientes" className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10" /></form></div>
      {clients.length === 0 ? <div className="p-12 text-center sm:p-16"><Users className="mx-auto mb-3 text-slate-300" size={36} /><h2 className="text-sm font-bold text-slate-900">{query ? 'Nenhum cliente encontrado' : 'Você ainda não tem clientes'}</h2><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">{query ? 'Tente buscar por outro nome, e-mail ou telefone.' : 'Seus clientes aparecerão aqui conforme novos agendamentos forem realizados.'}</p></div> : <div className="table-wrap border-0 rounded-none"><table><thead><tr><th>Cliente</th><th>Agendamentos</th><th>Status</th><th>Faturamento</th><th aria-label="Ações" /></tr></thead><tbody>{clients.map(client => <tr key={client.id}><td><Link href={`/clients/${client.id}`} className="group flex min-w-[230px] items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">{client.name[0].toUpperCase()}</div><div className="min-w-0"><div className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-600">{client.name}</div><div className="mt-0.5 flex max-w-[360px] items-center gap-2 truncate text-xs text-slate-500"><span className="flex items-center gap-1 truncate"><Mail size={11} />{client.email}</span>{client.phone && <span className="hidden items-center gap-1 sm:flex"><MessageCircle size={11} />{client.phone}</span>}</div></div><ChevronRight size={15} className="ml-auto shrink-0 text-slate-300 group-hover:text-indigo-500" /></Link></td><td><span className="font-semibold text-slate-700">{client.totalAppointments}</span></td><td><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${client.cancelRate > 20 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{client.cancelRate > 20 ? 'Atenção' : 'Ativo'}</span></td><td><span className="font-semibold text-slate-900">R$ {client.totalRevenue.toFixed(2)}</span></td><td><div className="flex justify-end gap-1">{client.phone && <a href={`https://wa.me/${client.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp de ${client.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50"><MessageCircle size={16} /></a>}<button type="button" aria-label={`Mais ações para ${client.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal size={17} /></button></div></td></tr>)}</tbody></table></div>}
    </section>
    {pagination.totalPages > 1 && <nav aria-label="Paginação" className="mt-5 flex justify-center gap-1.5">{Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => <Link key={p} href={`?q=${encodeURIComponent(query)}&page=${p}`} aria-current={p === page ? 'page' : undefined} className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold ${p === page ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{p}</Link>)}</nav>}
  </div>
}
