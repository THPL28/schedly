'use client'

import { useState } from 'react'
import { register } from '@/lib/actions'
import Link from 'next/link'
import { ShieldCheck, UserPlus } from 'lucide-react'

export default function RegisterPage() {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError('')

        const r = await register(formData)
        if (r?.error) {
            setError(r.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="card w-full max-w-[440px] p-8 md:p-12">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 no-underline text-foreground">
                        <div className="w-6 h-6 bg-primary rounded"></div>
                        <span className="text-xl font-extrabold text-foreground">Schedly</span>
                    </Link>
                    <h1 className="text-3xl font-extrabold m-0 mb-2">Crie sua conta</h1>
                    <p className="text-muted text-base m-0">Comece agora a gerenciar sua agenda de forma simples.</p>
                </div>

                <form action={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="label" htmlFor="name">Nome Completo</label>
                        <input id="name" name="name" type="text" required className="input" placeholder="Seu nome" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="label" htmlFor="email">E-mail Profissional</label>
                        <input id="email" name="email" type="email" required className="input" placeholder="exemplo@email.com" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="label" htmlFor="password">Senha</label>
                        <input id="password" name="password" type="password" required className="input" placeholder="Mínimo 8 caracteres" />
                    </div>

                    <div className="bg-muted-light p-4 rounded-xl flex gap-3 items-start">
                        <ShieldCheck size={20} className="text-success flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted m-0">
                            Ao criar sua conta, você aceita nossos Termos de Uso e Política de Privacidade.
                        </p>
                    </div>

                    {error && <div className="text-danger text-sm font-semibold">{error}</div>}

                    <button type="submit" className="btn btn-primary h-12 text-base w-full" disabled={loading}>
                        {loading ? 'Criando conta...' : 'Criar minha conta'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-muted">
                    Já tem uma conta? <Link href="/login" className="text-primary font-bold no-underline hover:underline">Entrar</Link>
                </div>
            </div>
        </div>
    )
}
