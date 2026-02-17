'use client'
import { useState } from 'react'
import { activateSubscription, expireSubscription } from '@/lib/actions'
import { useRouter } from 'next/navigation'

export default function AdminActions({ userId, currentStatus }: any) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleActivate = async () => {
        if (!confirm('Activate subscription for this user?')) return
        setLoading(true)
        await activateSubscription(userId)
        setLoading(false)
        // revalidatePath handles refresh usually, or router.refresh()
        // Since action revalidates /admin, it should be fine. But client router cache might persist?
        // We can force refresh.
    }

    const handleExpire = async () => {
        if (!confirm('Expire subscription for this user?')) return
        setLoading(true)
        await expireSubscription(userId)
        setLoading(false)
    }

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            {currentStatus !== 'ACTIVE' && (
                <button onClick={handleActivate} disabled={loading} className="btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid var(--success)', color: 'var(--success)', background: 'white' }}>
                    Activate
                </button>
            )}
            {currentStatus !== 'EXPIRED' && currentStatus !== 'CANCELED' && (
                <button onClick={handleExpire} disabled={loading} className="btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid var(--danger)', color: 'var(--danger)', background: 'white' }}>
                    Expire
                </button>
            )}
        </div>
    )
}
