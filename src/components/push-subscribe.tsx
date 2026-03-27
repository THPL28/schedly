'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, Smartphone } from 'lucide-react'
import FeedbackBanner from './feedback-banner'

type FeedbackState = {
  variant: 'success' | 'error' | 'info'
  title: string
  message: string
} | null

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export default function PushSubscribe() {
  const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
  const [subscribed, setSubscribed] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>(null)

  const showFeedback = (
    variant: NonNullable<FeedbackState>['variant'],
    title: string,
    message: string
  ) => {
    setFeedback({ variant, title, message })
  }

  useEffect(() => {
    if (!supported) return

    fetch('/api/push/publicKey')
      .then((r) => r.json())
      .then((j) => {
        if (j?.publicKey) {
          setPublicKey(j.publicKey)
        }
      })
      .catch(() => {
        showFeedback('error', 'Push indisponível', 'Não foi possível carregar a configuração de notificações.')
      })

    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((s) => setSubscribed(!!s))
    )
  }, [supported])

  async function subscribe() {
    if (!publicKey) {
      showFeedback('error', 'Configuração ausente', 'A chave de notificações não está disponível no servidor.')
      return
    }

    const reg = await navigator.serviceWorker.ready
    setLoading(true)
    setFeedback(null)

    try {
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })

      setSubscribed(true)
      showFeedback('success', 'Notificações ativadas', 'Você passará a receber lembretes importantes direto no dispositivo.')
    } catch (err) {
      console.error(err)
      showFeedback('error', 'Falha ao ativar', 'Não foi possível concluir a inscrição para notificações push.')
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready
    const s = await reg.pushManager.getSubscription()
    setLoading(true)
    setFeedback(null)

    try {
      if (s) {
        await s.unsubscribe()
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: s.endpoint }),
        })
      }

      setSubscribed(false)
      showFeedback('info', 'Notificações pausadas', 'Os avisos push foram desativados para este navegador.')
    } catch (err) {
      console.error(err)
      showFeedback('error', 'Falha ao desativar', 'Não foi possível remover a inscrição de notificações agora.')
    } finally {
      setLoading(false)
    }
  }

  if (!supported) return null

  return (
    <div className="card border-border/50 bg-white p-5 md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <Smartphone size={24} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 md:text-xl">Notificações Push</h3>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                  subscribed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {subscribed ? 'Ativas' : 'Inativas'}
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-muted">
              Receba lembretes e atualizações importantes da agenda sem depender apenas de e-mail.
            </p>
          </div>
        </div>

        {publicKey ? (
          subscribed ? (
            <button className="btn btn-outline h-12 px-6" onClick={unsubscribe} disabled={loading}>
              <BellOff size={16} />
              {loading ? 'Desativando...' : 'Desativar push'}
            </button>
          ) : (
            <button className="btn btn-primary h-12 px-6" onClick={subscribe} disabled={loading}>
              <Bell size={16} />
              {loading ? 'Ativando...' : 'Ativar lembretes por push'}
            </button>
          )
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Push indisponível neste ambiente.
          </div>
        )}
      </div>

      {feedback && (
        <FeedbackBanner
          variant={feedback.variant}
          title={feedback.title}
          message={feedback.message}
          className="mt-5 animate-in fade-in slide-in-from-top-2"
        />
      )}
    </div>
  )
}
