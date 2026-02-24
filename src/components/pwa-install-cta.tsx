'use client'

import { useEffect, useState } from 'react'
import Logo from './logo'

export default function PWAInstallCTA() {
  const [visible, setVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
    if (isStandalone) return

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)

    // Show banner automatically for iOS after 10 seconds if not installed
    if (ios) {
      const timer = setTimeout(() => setVisible(true), 15000)
      return () => clearTimeout(timer)
    }

    function onAvailable() {
      setVisible(true)
    }
    window.addEventListener('pwa:prompt-available', onAvailable)
    return () => window.removeEventListener('pwa:prompt-available', onAvailable)
  }, [])

  async function handleInstall() {
    if (isIOS) {
      // For iOS, we just show instructions (no native prompt)
      return
    }

    const dp = (window as any).deferredPrompt
    if (!dp) return setVisible(false)
    try {
      dp.prompt()
      const choice = await dp.userChoice
      setVisible(false)
    } catch (e) {
      setVisible(false)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] w-[min(980px,94%)] max-w-lg bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-4 border border-slate-100 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
          <Logo size={20} className="!gap-0 [&>span]:hidden" />
        </div>
        <div className="flex-1">
          <div className="font-black text-slate-900">Instalar Schedly</div>
          <div className="text-xs text-slate-500 font-medium leading-tight">
            {isIOS
              ? 'Toque em Compartilhar e selecione "Adicionar à Tela de Início"'
              : 'Adicione à tela inicial para acesso instantâneo e offline.'}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button onClick={() => setVisible(false)} className="btn btn-outline border-none text-slate-400 hover:text-slate-600 px-4 h-10 text-xs font-bold uppercase tracking-wider">Agora não</button>
        {!isIOS && (
          <button onClick={handleInstall} className="btn btn-primary px-6 h-10 text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20">Instalar App</button>
        )}
      </div>
    </div>
  )
}
