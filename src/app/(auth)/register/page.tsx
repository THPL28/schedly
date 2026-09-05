'use client'

import { useState } from 'react'
import { register } from '@/lib/actions'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import Logo from '@/components/logo'

export default function RegisterPage() {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        setLoading(true)
        setError('')
        const r = await register(formData)
        if (r?.error) { setError(r.error); setLoading(false) }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <div className="w-full max-w-[420px]">
                <div className="mb-7 text-center"><Link href="/" className="inline-flex no-underline"><Logo size={40} /></Link><h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Crie sua conta</h1><p className="mt-1 text-sm text-slate-500">Organize sua agenda e comece a receber agendamentos.</p></div>
                <div className="section-card p-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div><label className="field-label" htmlFor="name">Nome completo</label><input id="name" name="name" type="text" autoComplete="name" required className="input" placeholder="Seu nome" /></div>
                        <div><label className="field-label" htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="voce@empresa.com" /></div>
                        <div><label className="field-label" htmlFor="password">Senha</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="input" placeholder="Mínimo de 8 caracteres" /><p className="field-help">Escolha uma senha com pelo menos 8 caracteres.</p></div>
                        <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" /><p className="m-0 text-xs leading-5 text-slate-500">Seus dados são usados para criar e gerenciar sua conta no Schedly.</p></div>
                        {error && <div role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{error}</div>}
                        <button type="submit" className="ui-btn ui-btn-primary mt-1 w-full" disabled={loading}>{loading ? 'Criando conta...' : 'Criar conta'}</button>
                    </form>
                    <p className="mt-5 text-center text-sm text-slate-500">Já tem uma conta? <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Entrar</Link></p>
                </div>
            </div>
        </main>
    )
}
