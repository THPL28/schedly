'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Settings,
    ExternalLink
} from 'lucide-react'

export default function SidebarNav({ slug }: { slug?: string | null }) {
    const pathname = usePathname()

    const navItems = [
        { href: '/dashboard', label: 'Painel Diário', icon: LayoutDashboard },
        { href: '/settings', label: 'Configurações', icon: Settings },
    ]

    return (
        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`hover-item ${isActive ? 'sidebar-active' : ''}`}
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
                        className="hover-item"
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
    )
}
