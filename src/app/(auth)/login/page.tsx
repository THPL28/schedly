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
            if ((r as any).expired) {
                window.location.href = '/pricing?expired=true'
                return
            }
            setError(r.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="card max-w-[440px] w-full p-6 sm:p-8">
                <div className="text-center mb-8 sm:mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 no-underline">
                        <Logo size={28} />
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-extrabold mb-1">Bem-vindo de volta</h1>
                    <p className="text-sm sm:text-base text-muted">Acesse sua conta para gerenciar sua agenda.</p>
                </div>

                <form action={handleSubmit} className="flex flex-col gap-5">
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

                    <button type="submit" className="btn btn-primary h-12 text-base" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-muted">
                    Não tem uma conta? <Link href="/register" className="text-primary font-bold no-underline">Criar conta grátis</Link>
                </div>
            </div>
        </div>
    )
}
