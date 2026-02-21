'use client'

import { useEffect, useState } from 'react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export default function PushSubscribe() {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)

  useEffect(() => {
    setSupported(!!('serviceWorker' in navigator && 'PushManager' in window))
    // fetch vapid key
    fetch('/api/push/publicKey').then((r) => r.json()).then((j) => {
      if (j?.publicKey) setPublicKey(j.publicKey)
    }).catch(() => {})

    // check existing subscription
    navigator.serviceWorker.ready.then((reg) => reg.pushManager.getSubscription().then((s) => setSubscribed(!!s)))
  }, [])

  async function subscribe() {
    if (!publicKey) return alert('VAPID public key not configured on server')
    const reg = await navigator.serviceWorker.ready
    try {
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) })
      await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) })
      setSubscribed(true)
      alert('Inscrição para notificações ativada')
    } catch (err) {
      console.error(err)
      alert('Falha ao inscrever para notificações')
    }
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready
    const s = await reg.pushManager.getSubscription()
    if (s) {
      await s.unsubscribe()
      await fetch('/api/push/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: s.endpoint }) })
      setSubscribed(false)
    }
  }

  if (!supported) return null

  return (
    <div className="mt-4">
      <div className="label">Notificações (Push)</div>
      {publicKey ? (
        <div className="flex gap-3 items-center mt-2">
          {subscribed ? (
            <button className="btn btn-outline" onClick={unsubscribe}>Desativar</button>
          ) : (
            <button className="btn btn-primary" onClick={subscribe}>Ativar lembretes por push</button>
          )}
          <small className="text-xs text-muted">Receba lembretes e notificações importantes</small>
        </div>
      ) : (
        <div className="text-xs text-muted mt-2">VAPID public key não configurada no servidor — não disponível.</div>
      )}
    </div>
  )
}
