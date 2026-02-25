'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Settings,
    ExternalLink,
    CreditCard,
    Calendar,
    Clock,
    Users,
    BarChart3
} from 'lucide-react'

import { useState, useEffect } from 'react'

export default function SidebarNav({ slug }: { slug?: string | null }) {
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setMounted(true)
    }, [])

    const navItems = [
        { href: '/dashboard', label: 'Painel Diário', icon: LayoutDashboard },
        { href: '/clients', label: 'Clientes', icon: Users },
        { href: '/settings/event-types', label: 'Serviços', icon: Calendar },
        { href: '/settings/availability', label: 'Disponibilidade', icon: Clock },
        { href: '/reports', label: 'Relatórios', icon: BarChart3 },
        { href: '/billing', label: 'Assinatura', icon: CreditCard },
        { href: '/settings', label: 'Configurações', icon: Settings },
    ]

    return (
        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.map((item) => {
                const isActive = mounted && pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-link ${isActive ? 'active' : ''}`}
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
