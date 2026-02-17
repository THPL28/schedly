'use client'

import { updateSettings } from '@/lib/actions'
import { useState } from 'react'
import { Link2, User, Globe, CheckCircle } from 'lucide-react'

export default function SettingsForm({ user }: { user: any }) {
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setMessage('')
        setIsError(false)
        const res = await updateSettings(formData)
        setLoading(false)

        if (res?.success) {
            setMessage('Configurações salvas com sucesso!')
        }
        if (res?.error) {
            setMessage(res.error)
            setIsError(true)
        }
    }

    return (
        <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={14} /> Nome Profissional
                    </label>
                    <input name="name" defaultValue={user?.name || ''} className="input" placeholder="Seu nome ou nome do negócio" />
                </div>

                <div>
                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link2 size={14} /> Link Público de Agendamento
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0 1rem' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>schedly.com/book/</span>
                        <input
                            name="slug"
                            defaultValue={user?.slug || ''}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                padding: '0.75rem 0.5rem',
                                flex: 1,
                                outline: 'none',
                                color: 'var(--primary)',
                                fontWeight: 600,
                                fontSize: '0.875rem'
                            }}
                            placeholder="ex: barbearia-do-joao"
                        />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Dica: Use um nome fácil para seus clientes decorarem.</p>
                </div>

                <div>
                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Globe size={14} /> Idioma do Sistema
                    </label>
                    <select name="language" defaultValue={user?.language || 'pt-BR'} className="input">
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en">English (International)</option>
                    </select>
                </div>
            </div>

            {message && (
                <div style={{
                    background: isError ? '#fef2f2' : '#ecfdf5',
                    color: isError ? '#991b1b' : '#059669',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: `1px solid ${isError ? '#fee2e2' : '#d1fae5'}`
                }}>
                    {isError ? null : <CheckCircle size={18} />}
                    <span>{message}</span>
                </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', padding: '1rem 2rem', borderRadius: '0.75rem' }}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </form>
    )
}
