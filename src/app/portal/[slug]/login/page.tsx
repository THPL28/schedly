'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Logo } from '@/components/logo'

export default function PortalLogin() {
    const { slug } = useParams()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const res = await fetch('/api/client/auth/magic-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, providerSlug: slug })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Erro ao enviar link')

            setMessage('Link mágico enviado! Verifique seu email.')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="card w-full max-w-md scale-in">
                <div className="text-center mb-8">
                    <Logo size={48} className="mx-auto mb-4" />
                    <h1 className="text-2xl font-bold">Portal do Cliente</h1>
                    <p className="text-muted text-sm mt-2">Acesse seus agendamentos via link mágico</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Seu Email</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="seu@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full py-3"
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar Link de Acesso'}
                    </button>
                </form>

                {message && (
                    <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100 shake">
                        {error}
                    </div>
                )}

                <p className="text-center text-xs text-muted mt-8">
                    Apenas clientes com agendamentos vinculados podem acessar este portal.
                </p>
            </div>
        </div>
    )
}
