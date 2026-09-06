'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Logo from '@/components/logo'

export default function PortalLogin() {
    const { slug } = useParams()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError(''); setMessage('')
        try {
            const res = await fetch('/api/client/auth/magic-link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, providerSlug: slug }) })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Não foi possível enviar o link.')
            setMessage('Confira seu e-mail. O link de acesso foi enviado.')
        } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível enviar o link.') }
        finally { setLoading(false) }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <div className="w-full max-w-[400px]">
                <div className="mb-7 text-center"><Logo size={42} className="mx-auto" /><h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Acessar meus agendamentos</h1><p className="mt-1 text-sm text-slate-500">Informe o e-mail usado no seu agendamento.</p></div>
                <div className="section-card p-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div><label className="field-label" htmlFor="portal-email">E-mail</label><input id="portal-email" type="email" autoComplete="email" className="input" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                        <button type="submit" className="ui-btn ui-btn-primary w-full" disabled={loading}>{loading ? 'Enviando link...' : 'Enviar link de acesso'}</button>
                    </form>
                    {message && <div role="status" className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{message}</div>}
                    {error && <div role="alert" className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
                    <p className="mt-5 border-t border-slate-100 pt-4 text-center text-xs leading-5 text-slate-500">O acesso é feito por um link temporário enviado para seu e-mail. Você não precisa memorizar uma senha.</p>
                </div>
            </div>
        </main>
    )
}
