'use client'

import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const [online, setOnline] = useState<boolean>(true)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Sync status immediately on mount
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
    setOnline(isOnline)
    if (!isOnline) setShow(true)

    const onOnline = () => {
      setOnline(true)
      setShow(false)
    }
    const onOffline = () => {
      setOnline(false)
      setShow(true)
    }

    window.addEventListener('pwa:online', onOnline)
    window.addEventListener('pwa:offline', onOffline)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('pwa:online', onOnline)
      window.removeEventListener('pwa:offline', onOffline)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white shadow-2xl border border-white/10 text-sm flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      <span className="font-medium">
        {online ? 'Conexão instável detectada' : 'Sem conexão — modo offline ativo'}
      </span>
      <button
        onClick={() => setShow(false)}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity p-1 font-bold"
        aria-label="Fechar"
      >
        ✕
      </button>
    </div>
  )
}
