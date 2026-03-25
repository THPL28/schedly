'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Users, TrendingUp, Settings, Clock } from 'lucide-react'
import QuickActions from './quick-actions'
import Link from 'next/link'

export default function HeaderTabs({ userSlug }: { userSlug?: string | null }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isMounted, setIsMounted] = (require('react')).useState(false)
    
    ;(require('react')).useEffect(() => {
        setIsMounted(true)
    }, [])

    if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/book/')) return null
    if (!isMounted) return <div className="h-16 w-full" /> // Placeholder stable

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
        <div className="flex justify-center w-full pointer-events-none sticky top-4 z-[100] animate-in fade-in slide-in-from-top-4 duration-1000">
            <nav className="flex items-center bg-white/90 backdrop-blur-2xl border border-slate-200/50 p-1.5 rounded-full shadow-[0_25px_80px_-15px_rgba(0,0,0,0.15)] pointer-events-auto h-16">
                <div className="flex items-center gap-1">
                    {tabs.map((tab) => {
                        const isActive = activeId === tab.id
                        return (
                            <Link
                                key={tab.id}
                                href={tab.path}
                                className={`
                                    relative flex items-center gap-3 px-6 h-12 rounded-full transition-all duration-500 no-underline group
                                    ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50/50'}
                                `}
                            >
                                {isActive && (
                                    <div 
                                        className="absolute inset-0 rounded-full shadow-lg shadow-primary/20 animate-in fade-in zoom-in-95 duration-500"
                                        style={{ backgroundColor: tab.color, zIndex: -1 }}
                                    />
                                )}
                                <tab.icon 
                                    size={18} 
                                    className={`transition-all duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'}`}
                                />
                                <span 
                                    className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all
                                        ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100 hidden sm:inline'}
                                    `}
                                >
                                    {tab.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>

                <div className="w-px h-8 bg-slate-200/40 mx-4 hidden sm:block"></div>
                
                <div className="flex items-center px-2">
                    <QuickActions userSlug={userSlug || ""} isSmall />
                </div>
            </nav>
        </div>
    )
}
