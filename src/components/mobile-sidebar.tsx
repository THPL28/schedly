'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { X, LayoutDashboard, Settings, ExternalLink, LogOut } from 'lucide-react'
import Logo from './logo'
import Image from 'next/image'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  slug?: string | null
  user?: {
    name?: string | null
    email?: string
    avatarUrl?: string | null
  }
  onLogout?: () => void
}

export default function MobileSidebar({ isOpen, onClose, slug, user, onLogout }: MobileSidebarProps) {
  const pathname = usePathname()

  // Fechar ao navegar
  useEffect(() => {
    if (isOpen) {
      onClose()
    }
  }, [pathname])

  // Prevenir scroll do body quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const navItems = [
    { href: '/dashboard', label: 'Painel Diário', icon: LayoutDashboard },
    { href: '/settings', label: 'Configurações', icon: Settings },
  ]

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className="mobile-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          maxWidth: '85vw',
          background: 'var(--sidebar-bg)',
          color: 'white',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          boxShadow: isOpen ? '2px 0 10px rgba(0, 0, 0, 0.3)' : 'none'
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1f2937' }}>
          <Link href="/dashboard" className="no-underline" onClick={onClose}>
            <Logo size={28} />
          </Link>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1.25rem',
                  borderRadius: '1rem',
                  textDecoration: 'none',
                  color: isActive ? 'white' : '#94a3b8',
                  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  transition: 'all 0.2s',
                  fontWeight: isActive ? 700 : 500
                }}
              >
                <item.icon size={20} style={{ color: isActive ? 'var(--primary)' : 'inherit' }} />
                <span>{item.label}</span>
              </Link>
            )
          })}

          {slug && (
            <div style={{ marginTop: '2rem', padding: '0 1rem' }}>
              <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Link Público</p>
              <Link
                href={`/book/${slug}`}
                target="_blank"
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                  borderRadius: '1rem',
                  textDecoration: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                <span>Seu Link de Agendamento</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          )}
        </nav>

        {/* User Profile Footer */}
        <div style={{ borderTop: '1px solid #1f2937', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/settings" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            {user?.avatarUrl ? (
              <div style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)', flexShrink: 0 }}>
                {user.avatarUrl.startsWith('data:') ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || 'Perfil'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name || 'Perfil'}
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized={user.avatarUrl.startsWith('/uploads/')}
                  />
                )}
              </div>
            ) : (
              <div style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: 'white',
                fontSize: '0.9rem',
                flexShrink: 0
              }}>
                {getInitials(user?.name)}
              </div>
            )}
            <div style={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white' }}>{user?.name || 'Usuário'}</p>
              <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
            </div>
          </Link>
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1.25rem',
                borderRadius: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                width: '100%'
              }}
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}

