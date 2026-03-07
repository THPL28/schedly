'use client'
import { useState } from 'react'
import { activateSubscription, expireSubscription, extendTrial, setUserRole } from '@/lib/actions'
import { useRouter } from 'next/navigation'

export default function AdminActions({ userId, currentStatus, userRole }: any) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleActivate = async () => {
        if (!confirm('Activate subscription for this user?')) return
        setLoading(true)
        await activateSubscription(userId)
        setLoading(false)
    }

    const handleExpire = async () => {
        if (!confirm('Expire subscription for this user?')) return
        setLoading(true)
        await expireSubscription(userId)
        setLoading(false)
    }

    const handleExtendTrial = async (days: number) => {
        if (!confirm(`Extend trial by ${days} days?`)) return
        setLoading(true)
        await extendTrial(userId, days)
        setLoading(false)
    }

    const handleToggleRole = async () => {
        const newRole = userRole === 'ADMIN' ? 'USER' : 'ADMIN'
        if (!confirm(`Change user role to ${newRole}?`)) return
        setLoading(true)
        await setUserRole(userId, newRole)
        setLoading(false)
    }

    return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {currentStatus !== 'ACTIVE' && (
                <button onClick={handleActivate} disabled={loading} className="btn" style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', border: '1px solid var(--success)', color: 'var(--success)', background: 'white' }}>
                    Ativar
                </button>
            )}

            <button onClick={() => handleExtendTrial(30)} disabled={loading} className="btn" style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'white' }}>
                +30 Dias Trial
            </button>

            <button onClick={() => handleExtendTrial(3650)} disabled={loading} className="btn" style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'white' }}>
                Liberar Grátis (10 anos)
            </button>

            <button onClick={handleToggleRole} disabled={loading} className="btn" style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', border: '1px solid #64748b', color: '#64748b', background: 'white' }}>
                {userRole === 'ADMIN' ? 'Remover Admin' : 'Tornar Admin'}
            </button>

            {currentStatus !== 'EXPIRED' && currentStatus !== 'CANCELED' && (
                <button onClick={handleExpire} disabled={loading} className="btn" style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', border: '1px solid var(--danger)', color: 'var(--danger)', background: 'white' }}>
                    Expirar
                </button>
            )}
        </div>
    )
}
