'use client'

import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
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

  if (online) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-amber-600 text-white shadow-md text-sm">
      Sem conexão — alterações offline serão sincronizadas quando a conexão for restabelecida.
    </div>
  )
}
