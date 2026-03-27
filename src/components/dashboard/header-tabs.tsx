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

    useEffect(() => {
        setIsMounted(true)
    }, [])

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
        { id: 'agenda', label: 'Agenda', icon: Calendar, color: 'rgb(99, 102, 241)', path: '/dashboard?tab=agenda' },
        { id: 'clientes', label: 'Clientes', icon: Users, color: 'rgb(16, 185, 129)', path: '/clients' },
        { id: 'analytics', label: 'Relatórios', icon: TrendingUp, color: 'rgb(245, 158, 11)', path: '/reports' },
        { id: 'servicos', label: 'Serviços', icon: Settings, color: 'rgb(244, 63, 94)', path: '/settings/event-types' },
    ]

    return (
        <div className="header-tabs-shell animate-in fade-in slide-in-from-top-4 duration-1000">
            <nav className="header-tabs-nav" aria-label="Navegação principal do dashboard">
                <div className="header-tabs-scroll">
                    {tabs.map((tab) => {
                        const isActive = activeId === tab.id
                        return (
                            <Link
                                key={tab.id}
                                href={tab.path}
                                className={`header-tab-link group ${isActive ? 'is-active' : ''}`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {isActive && (
                                    <div
                                        className="header-tab-bg animate-in fade-in zoom-in-95 duration-500"
                                        style={{ backgroundColor: tab.color }}
                                    />
                                )}
                                <tab.icon
                                    size={18}
                                    className={`header-tab-icon ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'}`}
                                />
                                <span className="header-tab-label">{tab.label}</span>
                            </Link>
                        )
                    })}
                </div>

                <div className="header-tabs-divider"></div>

                <div className="header-tabs-action">
                    <QuickActions userSlug={userSlug || ''} isSmall />
                </div>
            </nav>
        </div>
    )
}
