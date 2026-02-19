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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="card w-full max-w-[440px] p-0 overflow-hidden border-none shadow-2xl">
                {/* Modal Header */}
                <div className="bg-primary text-white p-8 relative">
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
                <form action={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-5 sm:gap-6">
                    <input type="hidden" name="date" value={date} />

                    <div>
                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={14} /> Nome do Cliente
                        </label>
                        <input name="clientName" required className="input h-12" placeholder="Ex: João Silva" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        <div style={{ flex: 1 }}>
                            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={14} /> Início
                            </label>
                            <input name="startTime" type="time" required className="input h-11 sm:h-12" defaultValue={startTime} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={14} /> Término
                            </label>
                            <input name="endTime" type="time" required className="input h-11 sm:h-12" defaultValue={endTimeDefault} />
                        </div>
                    </div>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '1rem', borderRadius: '0.75rem', color: '#991b1b', fontSize: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <X size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button type="button" onClick={onClose} className="btn btn-outline flex-1 h-11 sm:h-12 text-sm sm:text-base">Cancelar</button>
                        <button type="submit" className="btn btn-primary flex-2 h-11 sm:h-12 text-sm sm:text-base" disabled={loading}>
                            {loading ? 'Agendando...' : 'Confirmar Agendamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
