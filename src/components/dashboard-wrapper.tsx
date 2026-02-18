'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import MobileSidebar from './mobile-sidebar'

interface DashboardWrapperProps {
  children: React.ReactNode
  user: {
    name?: string | null
    email?: string
    avatarUrl?: string | null
  }
  slug?: string | null
}

export default function DashboardWrapper({ children, user, slug }: DashboardWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        slug={slug}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="dashboard-layout">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="sidebar desktop-sidebar">
          {/* Sidebar content será renderizado pelo layout */}
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <header className="top-nav">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
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
              <p className="top-nav-date" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'capitalize', display: 'none' }}>
                {/* Date será inserido pelo layout */}
              </p>
              <div className="top-nav-divider" style={{ height: 32, width: 1, background: '#e2e8f0', display: 'none' }}></div>
              <button style={{ position: 'relative', background: '#f8fafc', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', color: '#94a3b8' }}>
                {/* Bell icon será inserido pelo layout */}
              </button>
            </div>
          </header>

          <div className="scroll-area">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}

