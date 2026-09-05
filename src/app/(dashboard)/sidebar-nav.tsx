'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Settings, ExternalLink, CreditCard, Calendar, Clock, Users, BarChart3, Stethoscope } from 'lucide-react'

export default function SidebarNav({ slug }: { slug?: string | null }) {
  const pathname = usePathname()
  const navItems = [
    { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
    { href: '/calendar', label: 'Agenda', icon: Calendar },
    { href: '/clients', label: 'Clientes', icon: Users },
    { href: '/settings/event-types', label: 'Serviços', icon: Clock },
    { href: '/settings/availability', label: 'Disponibilidade', icon: Clock },
    { href: '/reports', label: 'Relatórios', icon: BarChart3 },
  ]
  const secondaryItems = [
    { href: '/settings/medical', label: 'Modo Médico', icon: Stethoscope },
    { href: '/billing', label: 'Assinatura', icon: CreditCard },
    { href: '/settings', label: 'Configurações', icon: Settings },
  ]
  const renderItem = (item: typeof navItems[number]) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
    const Icon = item.icon
    return <Link key={item.href} href={item.href} className={`nav-link ${isActive ? 'active' : ''}`} aria-current={isActive ? 'page' : undefined}><Icon size={18} aria-hidden="true" /><span>{item.label}</span></Link>
  }
  return <nav aria-label="Navegação principal" style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{navItems.map(renderItem)}</div>
    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {secondaryItems.map(renderItem)}
      {slug && <Link href={`/book/${slug}`} target="_blank" rel="noreferrer" className="sidebar-public-link" aria-label="Abrir página pública de agendamento"><span><strong>Agendamento público</strong><small>Ver como seu cliente</small></span><ExternalLink size={15} aria-hidden="true" /></Link>}
    </div>
  </nav>
}
