'use client'

import { useState } from 'react'
import { login } from '@/lib/actions'
import Link from 'next/link'
import Logo from '@/components/logo'

export default function LoginPage() {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
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
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <div className="w-full max-w-[400px]">
                <div className="mb-7 text-center">
                    <Link href="/" className="inline-flex no-underline"><Logo size={40} /></Link>
                    <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Bem-vindo de volta</h1>
                    <p className="mt-1 text-sm text-slate-500">Entre para gerenciar sua agenda.</p>
                </div>
                <div className="section-card p-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div><label className="field-label" htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="seu@email.com" /></div>
                        <div><div className="mb-1.5 flex items-center justify-between"><label className="field-label mb-0" htmlFor="password">Senha</label><span className="text-xs text-slate-400">Use sua senha cadastrada</span></div><input id="password" name="password" type="password" autoComplete="current-password" required className="input" placeholder="Sua senha" /></div>
                        {error && <div role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{error}</div>}
                        <button type="submit" className="ui-btn ui-btn-primary mt-1 w-full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
                    </form>
                    <p className="mt-5 text-center text-sm text-slate-500">Não tem uma conta? <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">Criar conta grátis</Link></p>
                </div>
            </div>
        </main>
    )
}
