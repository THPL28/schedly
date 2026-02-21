'use client'

import { useEffect, useState } from 'react'

export default function PWAUpdateToast() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onUpdated() {
      setVisible(true)
    }
    window.addEventListener('pwa:sw-updated', onUpdated)

    // reload on controllerchange (after skipWaiting)
    function onControllerChange() {
      window.location.reload()
    }
    window.addEventListener('controllerchange', onControllerChange)

    return () => {
      window.removeEventListener('pwa:sw-updated', onUpdated)
      window.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  async function updateNow() {
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-4">
      <div>
        <div className="font-semibold">Nova versão disponível</div>
        <div className="text-xs text-slate-300">Atualize para ver melhorias e correções</div>
      </div>
      <div className="ml-2">
        <button onClick={updateNow} className="btn btn-primary">Atualizar</button>
      </div>
    </div>
  )
}
