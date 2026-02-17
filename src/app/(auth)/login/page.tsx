'use client'

import { useState } from 'react'
import { login } from '@/lib/actions'
import Link from 'next/link'
import { LogIn } from 'lucide-react'
import Logo from '@/components/logo'

export default function LoginPage() {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError('')

        const r = await login(formData)
        if (r?.error) {
            setError(r.error)
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '3rem 2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 no-underline">
                        <Logo size={28} />
                    </Link>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Benvindo de volta</h1>
                    <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Acesse sua conta para gerenciar sua agenda.</p>
                </div>

                <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label className="label" htmlFor="email">E-mail</label>
                        <input id="email" name="email" type="email" required className="input" placeholder="seu@email.com" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <label className="label" htmlFor="password">Senha</label>
                            <Link href="#" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Esqueceu a senha?</Link>
                        </div>
                        <input id="password" name="password" type="password" required className="input" placeholder="••••••••" />
                    </div>

                    {error && <div style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 600 }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '3rem', fontSize: '1rem' }}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)' }}>
                    Não tem uma conta? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Criar conta grátis</Link>
                </div>
            </div>
        </div>
    )
}
