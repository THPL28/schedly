import { verifySession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { logout } from '@/lib/actions'
import { cookies } from 'next/headers'
import { getDictionary } from '@/lib/dictionaries'
import { Suspense } from 'react'
import {
    Calendar,
    Bell,
    LogOut,
    Menu,
} from 'lucide-react'
import SidebarNav from '@/app/(dashboard)/sidebar-nav'
import Link from 'next/link'
import Logo from '@/components/logo'
import Image from 'next/image'
import MobileSidebar from '@/components/mobile-sidebar'
import DashboardLayoutClient from '@/app/(dashboard)/dashboard-layout-client'
import HeaderTabs from '@/components/dashboard/header-tabs'
import CurrentDate from '@/components/current-date'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await verifySession()
    if (!session) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        include: { subscription: true }
    })

    if (!user) {
        redirect('/login')
    }

    // Whitelisted emails (No limitations, no payments)
    const WHITELIST_EMAILS = [
        'tiago.looze28@gmail.com',
        'thpldevweb@gmail.com',
        'flahwagner19@gmail.com'
    ]
    const isWhitelisted = WHITELIST_EMAILS.includes(user.email) || user.role === 'ADMIN'

    // Check subscription expiration
    if (user.subscription && !isWhitelisted) {
        const isExpired = user.subscription.status === 'EXPIRED' ||
            (user.subscription.status === 'TRIAL' &&
                user.subscription.trialEndDate &&
                new Date(user.subscription.trialEndDate) < new Date())

        if (isExpired) {
            redirect('/pricing?expired=true')
        }
    }

    // i18n
    const cookieStore = await cookies()
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'pt'
    const dict = await getDictionary(locale)

    // Get Initials (e.g. Tiago Looze -> TL)
    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U'

    return (
        <DashboardLayoutClient
            user={user}
            slug={user.slug}
            initials={initials}
        >
            {/* Desktop Sidebar */}
            <aside className="sidebar desktop-sidebar" style={{ borderRight: '1px solid var(--sidebar-border)' }}>
                <div style={{ padding: '2rem 1.5rem' }}>
                    <Link href="/dashboard" className="no-underline">
                        <Logo size={32} />
                    </Link>
                </div>

                {/* Simplified Nav */}
                <SidebarNav slug={user.slug} />

                {/* User Profile Footer */}
                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--sidebar-border)', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden', textDecoration: 'none', flex: 1, minWidth: 0 }}>
                        {user.avatarUrl ? (
                            <div style={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)', flexShrink: 0 }}>
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
                                width: 36,
                                height: 36,
                                background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                color: 'white',
                                fontSize: '0.8rem',
                                flexShrink: 0
                            }}>
                                {initials}
                            </div>
                        )}
                        <div style={{ overflow: 'hidden', minWidth: 0 }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--foreground)' }}>{user.name || 'Usuário'}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                        </div>
                    </Link>
                    <form action={logout}>
                        <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex', flexShrink: 0 }} title="Sair">
                            <LogOut size={18} />
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="top-nav">
                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn"
                        aria-label="Abrir menu"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="top-nav-main" style={{ justifyContent: 'center' }}>
                        <Suspense fallback={<div className="h-16 w-full" />}>
                            <HeaderTabs userSlug={user.slug} />
                        </Suspense>
                    </div>

                    <div className="top-nav-tools">
                        <CurrentDate />
                        <div className="top-nav-divider"></div>
                        <button className="top-nav-notification" aria-label="Notificações">
                            <Bell size={22} />
                        </button>
                    </div>
                </header>

                <div className="scroll-area">
                    {children}
                </div>
            </main>
        </DashboardLayoutClient>
    )
}
