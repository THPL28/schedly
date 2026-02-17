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
} from 'lucide-react'
import SidebarNav from './sidebar-nav'
import Link from 'next/link'

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

    // i18n
    const cookieStore = await cookies()
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'pt'
    const dict = await getDictionary(locale)

    // Get Initials (e.g. Tiago Looze -> TL)
    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U'

    const todayStr = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    })

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={20} color="white" />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'white' }}>Schedly</span>
                </div>

                {/* Simplified Nav */}
                <SidebarNav slug={user.slug} />

                {/* User Profile Footer */}
                <div style={{ marginTop: 'auto', borderTop: '1px solid #1f2937', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                        <div style={{ width: 36, height: 36, background: '#374151', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '0.8rem' }}>
                            {initials}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white' }}>{user.name}</p>
                            <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                        </div>
                    </div>
                    <form action={logout}>
                        <button type="submit" style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex' }} title="Sair">
                            <LogOut size={18} />
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="top-nav">
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Gerenciamento Diário</h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'capitalize' }}>{todayStr}</p>
                        <div style={{ height: 32, width: 1, background: '#e2e8f0' }}></div>
                        <button style={{ position: 'relative', background: '#f8fafc', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', color: '#94a3b8' }}>
                            <Bell size={22} />
                        </button>
                    </div>
                </header>

                <div className="scroll-area">
                    {children}
                </div>
            </main>
        </div>
    )
}
