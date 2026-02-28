import { verifySession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { logout } from '@/lib/actions'
import { cookies } from 'next/headers'
import { getDictionary } from '@/lib/dictionaries'
import {
    Calendar,
    Bell,
    LogOut,
    Menu,
} from 'lucide-react'
import SidebarNav from './sidebar-nav'
import Link from 'next/link'
import Logo from '@/components/logo'
import Image from 'next/image'
import MobileSidebar from '@/components/mobile-sidebar'
import DashboardClient from './dashboard-client'
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
    const isWhitelisted = WHITELIST_EMAILS.includes(user.email)

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
        <DashboardClient
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
                        style={{
                            display: 'none',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: '#64748b',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        aria-label="Abrir menu"
                    >
                        <Menu size={24} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Gerenciamento Diário</h1>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <CurrentDate />
                        <div className="top-nav-divider" style={{ height: 32, width: 1, background: '#e2e8f0' }}></div>
                        <button style={{ position: 'relative', background: '#f8fafc', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', color: '#94a3b8' }}>
                            <Bell size={22} />
                        </button>
                    </div>
                </header>

                <div className="scroll-area">
                    {children}
                </div>
            </main>
        </DashboardClient>
    )
}
