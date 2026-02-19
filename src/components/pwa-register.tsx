'use client'

import { useEffect } from 'react'

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    let deferredPrompt: any = null

    // Register service worker
    navigator.serviceWorker
      .register('/sw.js')
      .then(async (registration) => {
        // try periodic sync registration (best-effort)
        try {
          if ('periodicSync' in registration) {
            // ask for permission first
            // @ts-ignore
            const status = await (navigator as any).permissions.query({ name: 'periodic-background-sync' })
            if (status.state === 'granted') {
              // register a periodic tag (browser support varies)
              // @ts-ignore
              await registration.periodicSync.register('periodic-availability', { minInterval: 6 * 60 * 60 * 1000 })
            }
          }
        } catch (e) {
          // ignore if unsupported
        }

        // poll for updates every hour
        setInterval(() => registration.update(), 60 * 60 * 1000)
      })
      .catch((error) => console.error('SW register failed', error))

    // Handle beforeinstallprompt to surface a custom install UI
    function onBeforeInstallPrompt(e: any) {
      // defensive: some platforms/extensions may dispatch a non-standard event
      if (e && typeof e.preventDefault === 'function') {
        try { e.preventDefault() } catch (_) { /* ignore */ }
      }
      (window as any).deferredPrompt = e
      window.dispatchEvent(new Event('pwa:prompt-available'))
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)

    // Listen for messages from SW to show update/install/queue status
    navigator.serviceWorker.addEventListener('message', (event) => {
      const msg = event.data || {}
      if (msg.type === 'QUEUE_STORED') {
        window.dispatchEvent(new CustomEvent('pwa:queue-stored'))
      }
      if (msg.type === 'QUEUE_SENT') {
        window.dispatchEvent(new CustomEvent('pwa:queue-sent', { detail: { id: msg.id } }))
      }
      if (msg.type === 'SW_CONTROLLER_CHANGE') {
        window.dispatchEvent(new Event('pwa:sw-updated'))
      }
    })

    const handleOnline = () => window.dispatchEvent(new Event('pwa:online'))
    const handleOffline = () => window.dispatchEvent(new Event('pwa:offline'))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return null
}

