'use client'

import { useEffect } from 'react'

export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Registrar Service Worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado com sucesso:', registration.scope)
          
          // Verificar atualizações periodicamente
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000) // A cada hora
        })
        .catch((error) => {
          console.error('❌ Erro ao registrar Service Worker:', error)
        })

      // Ouvir mensagens do service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Mensagem do Service Worker:', event.data)
      })

      // Detectar quando o app está online/offline
      const handleOnline = () => {
        console.log('🌐 Conexão restaurada')
      }

      const handleOffline = () => {
        console.log('📴 Conexão perdida')
      }

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      // Cleanup
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  return null
}

