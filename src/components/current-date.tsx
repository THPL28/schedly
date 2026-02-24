'use client'

import { useState, useEffect } from 'react'

export default function CurrentDate() {
    const [dateStr, setDateStr] = useState<string>('')

    useEffect(() => {
        const now = new Date()
        const formatted = now.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        })
        setDateStr(formatted)
    }, [])

    if (!dateStr) return <div style={{ height: '1.25rem', width: '100px' }} />

    return (
        <p className="top-nav-date" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'capitalize', margin: 0 }}>
            {dateStr}
        </p>
    )
}
