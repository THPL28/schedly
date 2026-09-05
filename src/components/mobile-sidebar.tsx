'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { X, LayoutDashboard, Settings, ExternalLink, LogOut, Calendar, Clock, CreditCard, Users, BarChart3, Stethoscope } from 'lucide-react'
import Logo from './logo'
import Image from 'next/image'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  slug?: string | null
  user?: { name?: string | null; email?: string; avatarUrl?: string | null }
}

export default function MobileSidebar({ isOpen, onClose, slug, user }: MobileSidebarProps) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  useEffect(() => setMounted(true), [])
  useEffect(() => { if (!isOpen) return; const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; document.addEventListener('keydown', onKeyDown); document.body.style.overflow = 'hidden'; return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = '' } }, [isOpen, onClose])
  useEffect(() => { if (isOpen) onClose() }, [pathname])

  const navItems = [
    { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
    { href: '/calendar', label: 'Agenda', icon: Calendar },
    { href: '/clients', label: 'Clientes', icon: Users },
    { href: '/settings/event-types', label: 'Serviços', icon: Clock },
    { href: '/settings/availability', label: 'Disponibilidade', icon: Clock },
    { href: '/reports', label: 'Relatórios', icon: BarChart3 },
    { href: '/settings/professional', label: 'Perfil profissional', icon: Stethoscope },
    { href: '/billing', label: 'Assinatura', icon: CreditCard },
    { href: '/settings', label: 'Configurações', icon: Settings },
  ]
  const getInitials = (name?: string | null) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

  return <>
    {isOpen && <button type="button" className="mobile-sidebar-overlay" aria-label="Fechar menu" onClick={onClose} />}
    <aside className={`mobile-sidebar ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen} aria-label="Menu principal">
      <div className="mobile-sidebar-head"><Link href="/dashboard" className="no-underline" onClick={onClose} aria-label="Ir para o dashboard"><Logo size={28} /></Link><button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar menu"><X size={20} /></button></div>
      <nav className="mobile-sidebar-nav" aria-label="Navegação principal">
        {navItems.map(({ href, label, icon: Icon }) => { const active = mounted && (pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`))); return <Link key={href} href={href} onClick={onClose} className={`nav-link ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined}><Icon size={19} aria-hidden="true" /><span>{label}</span></Link> })}
        {slug && <div className="sidebar-public-block"><p className="sidebar-public-label">Seu espaço público</p><Link href={`/book/${slug}`} target="_blank" rel="noreferrer" onClick={onClose} className="sidebar-public-link"><span><strong>Agendamento público</strong><small>Ver como seu cliente</small></span><ExternalLink size={15} aria-hidden="true" /></Link></div>}
      </nav>
      {mounted && <div className="mobile-sidebar-footer"><Link href="/settings" onClick={onClose} className="profile-link"><div className="profile-avatar">{user?.avatarUrl ? (user.avatarUrl.startsWith('data:') ? <img src={user.avatarUrl} alt={user.name || 'Perfil'} className="profile-avatar-image" /> : <Image src={user.avatarUrl} alt={user.name || 'Perfil'} fill className="profile-avatar-image" unoptimized={user.avatarUrl.startsWith('/uploads/')} />) : <span className="profile-avatar-fallback">{getInitials(user?.name)}</span>}</div><div className="profile-meta"><p className="profile-name">{user?.name || 'Usuário'}</p><p className="profile-email">{user?.email}</p></div></Link><form action="/api/logout" method="POST" onSubmit={onClose}><button type="submit" className="mobile-logout-btn" aria-label="Sair da conta"><LogOut size={18} /><span>Sair</span></button></form></div>}
    </aside>
  </>
}
