'use client'
import { useState } from 'react'
import { createAppointment } from '@/lib/actions'
import { X, Calendar, Clock, User } from 'lucide-react'

export default function BookingModal({ date, startTime, onClose }: any) {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError('')

        const res = await createAppointment(formData)
        if (res?.error) {
            setError(res.error)
            setLoading(false)
        } else {
            onClose()
        }
    }

    // Calculate default End Time (+1 hour)
    const [h, m] = startTime.split(':').map(Number)
    const endH = h + 1
    const endTimeDefault = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`

    const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    })

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '440px', padding: 0, overflow: 'hidden', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                {/* Modal Header */}
                <div style={{ background: 'var(--primary)', padding: '2rem', color: 'white', position: 'relative' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', display: 'flex' }}>
                        <X size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={20} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Novo Agendamento</h2>
                    </div>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize' }}>{displayDate}</p>
                </div>

                {/* Modal Body */}
                <form action={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <input type="hidden" name="date" value={date} />

                    <div>
                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={14} /> Nome do Cliente
                        </label>
                        <input name="clientName" required className="input" placeholder="Ex: João Silva" style={{ height: '3rem' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ flex: 1 }}>
                            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={14} /> Início
                            </label>
                            <input name="startTime" type="time" required className="input" defaultValue={startTime} style={{ height: '3rem' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={14} /> Término
                            </label>
                            <input name="endTime" type="time" required className="input" defaultValue={endTimeDefault} style={{ height: '3rem' }} />
                        </div>
                    </div>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '1rem', borderRadius: '0.75rem', color: '#991b1b', fontSize: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <X size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1, height: '3rem' }}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, height: '3rem', fontSize: '1rem' }}>
                            {loading ? 'Agendando...' : 'Confirmar Agendamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
