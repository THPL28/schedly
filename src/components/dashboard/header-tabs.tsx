'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Calendar, Users, TrendingUp, Settings } from 'lucide-react'
import QuickActions from './quick-actions'
import Link from 'next/link'

export default function HeaderTabs({ userSlug }: { userSlug?: string | null }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => setIsMounted(true), [])

    if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/book/')) return null
    if (!isMounted) return <div className="h-16 w-full" />

    const activeTabByPath = () => {
        if (pathname === '/dashboard') return searchParams.get('tab') || 'agenda'
        if (pathname === '/clients') return 'clientes'
        if (pathname === '/reports') return 'analytics'
        if (pathname.includes('/settings/event-types')) return 'servicos'
        if (pathname.includes('/availability')) return 'agenda'
        return 'agenda'
    }

    const activeId = activeTabByPath()
    const tabs = [
        { id: 'agenda', label: 'Agenda', icon: Calendar, path: '/dashboard?tab=agenda' },
        { id: 'clientes', label: 'Clientes', icon: Users, path: '/clients' },
        { id: 'analytics', label: 'Relatórios', icon: TrendingUp, path: '/reports' },
        { id: 'servicos', label: 'Serviços', icon: Settings, path: '/settings/event-types' },
    ]

    return (
        <div className="header-tabs-shell">
            <nav className="header-tabs-nav" aria-label="Navegação principal">
                <div className="header-tabs-scroll">
                    {tabs.map((tab) => {
                        const isActive = activeId === tab.id
                        return (
                            <Link key={tab.id} href={tab.path} className={`header-tab-link ${isActive ? 'is-active' : ''}`} aria-current={isActive ? 'page' : undefined}>
                                <tab.icon size={17} strokeWidth={isActive ? 2.4 : 2} />
                                <span className="header-tab-label">{tab.label}</span>
                            </Link>
                        )
                    })}
                </div>
                <div className="header-tabs-divider" />
                <div className="header-tabs-action">
                    <QuickActions userSlug={userSlug || ''} isSmall />
                </div>
            </nav>
        </div>
    )
}
