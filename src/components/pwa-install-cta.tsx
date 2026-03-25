'use client'

import { useEffect, useState } from 'react'

export default function PWAInstallCTA() {
  const [visible, setVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Robust check for dismissal (both localStorage and cookies)
    const isDismissed = () => {
        if (typeof window === 'undefined') return true
        if (localStorage.getItem('pwa-dismissed') === 'true') return true
        if (document.cookie.includes('pwa-dismissed=true')) return true
        return false
    }

    if (isDismissed()) return

    // Check if already in standalone mode
    const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone)
    if (isStandalone) return

    // Detect iOS
    const ios = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)

    // Show banner automatically for iOS after 15 seconds if not installed
    if (ios) {
      const timer = setTimeout(() => {
          if (!isDismissed()) setVisible(true)
      }, 15000)
      return () => clearTimeout(timer)
    }

    function onAvailable() {
      if (!isDismissed()) setVisible(true)
    }
    window.addEventListener('pwa:prompt-available', onAvailable)
    return () => window.removeEventListener('pwa:prompt-available', onAvailable)
  }, [])

  function handleDismiss() {
    setVisible(false)
    localStorage.setItem('pwa-dismissed', 'true')
    // Set a cookie for 365 days
    document.cookie = "pwa-dismissed=true; path=/; max-age=31536000; SameSite=Lax"
  }

  async function handleInstall() {
    if (isIOS) return

    const dp = (window as any).deferredPrompt
    if (!dp) return handleDismiss()
    try {
      dp.prompt()
      const choice = await dp.userChoice
      if (choice.outcome === 'accepted') {
        handleDismiss()
      }
    } catch (e) {
      handleDismiss()
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[min(940px,94%)] max-w-lg bg-white/95 backdrop-blur-2xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.25)] rounded-[2.5rem] p-6 border border-white flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center shadow-inner overflow-hidden shrink-0 border border-slate-100">
                <img 
                    src="/icon-192x192.png" 
                    alt="Logo" 
                    className="w-12 h-12 object-contain filter drop-shadow-sm" 
                />
            </div>
            <div className="flex-1">
                <div className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1">Instalar Schedly</div>
                <div className="text-sm text-slate-500 font-medium leading-normal">
                    {isIOS
                        ? 'Toque em Compartilhar e selecione "Adicionar à Tela de Início"'
                        : 'Adicione como um aplicativo em sua tela inicial para acesso instantâneo.'}
                </div>
            </div>
        </div>
        <div className="flex items-center gap-3 justify-end">
            <button 
                onClick={handleDismiss} 
                className="h-14 px-8 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold"
            >
                Agora não
            </button>
            {!isIOS && (
                <button 
                    onClick={handleInstall} 
                    className="bg-primary hover:bg-primary/90 text-white h-14 px-10 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 transition-all active:scale-95 font-bold"
                >
                    Instalar App
                </button>
            )}
        </div>
    </div>
  )
}
