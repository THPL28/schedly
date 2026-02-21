'use client'

import { useEffect, useState } from 'react'

export default function PWAInstallCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onAvailable() {
      setVisible(true)
    }
    window.addEventListener('pwa:prompt-available', onAvailable)
    return () => window.removeEventListener('pwa:prompt-available', onAvailable)
  }, [])

  async function handleInstall() {
    const dp = (window as any).deferredPrompt
    if (!dp) return setVisible(false)
    try {
      dp.prompt()
      const choice = await dp.userChoice
      // Hide either way
      setVisible(false)
      if (choice && choice.outcome === 'accepted') {
        console.log('PWA installed by user')
      }
    } catch (e) {
      setVisible(false)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(980px,92%)] max-w-3xl bg-white/95 backdrop-blur-sm shadow-lg rounded-lg p-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center text-white font-bold">PWA</div>
        <div>
          <div className="font-semibold">Instalar Schedly</div>
          <div className="text-xs text-muted">Adicionar o app à tela inicial para acesso rápido</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setVisible(false)} className="btn btn-outline">Fechar</button>
        <button onClick={handleInstall} className="btn btn-primary">Instalar</button>
      </div>
    </div>
  )
}
