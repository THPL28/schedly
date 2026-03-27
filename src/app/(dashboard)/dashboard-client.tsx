'use client'

import { useState, useEffect } from 'react'
import MobileSidebar from '@/components/mobile-sidebar'

interface DashboardClientProps {
  children: React.ReactNode
  user: {
    name?: string | null
    email?: string
    avatarUrl?: string | null
  }
  slug?: string | null
  initials: string
}

export default function DashboardClient({ children, user, slug, initials }: DashboardClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)


  // Adicionar event listener para o botão de menu
  useEffect(() => {
    const menuBtn = document.querySelector('.mobile-menu-btn') as HTMLButtonElement
    if (menuBtn) {
      const handleClick = () => setSidebarOpen(true)
      menuBtn.addEventListener('click', handleClick)
      return () => menuBtn.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <>
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        slug={slug}
        user={user}
      />

      <div className="dashboard-layout">
        {children}
      </div>
    </>
  )
}

