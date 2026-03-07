'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, History, Clock, XCircle, ChevronRight } from 'lucide-react'

export default function PortalDashboard() {
    const { slug } = useParams()
    const [appointments, setAppointments] = useState<{ future: any[], history: any[] } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/client/appointments')
            .then(res => res.json())
            .then(data => {
                setAppointments(data)
                setLoading(false)
            })
    }, [])

    if (loading) return <div className="p-8 text-center">Carregando seus agendamentos...</div>

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-bottom p-6 shadow-sm">
                <div className="container flex justify-between items-center">
                    <h1 className="text-xl font-bold">Meus Agendamentos</h1>
                    <div className="text-sm font-medium text-primary">Portal do Cliente</div>
                </div>
            </header>

            <main className="container py-8">
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="text-primary" size={20} />
                        <h2 className="text-lg font-bold">Próximos Agendamentos</h2>
                    </div>

                    <div className="grid gap-4">
                        {appointments?.future.length === 0 ? (
                            <div className="card text-center py-12 text-muted">Você não tem agendamentos futuros.</div>
                        ) : (
                            appointments?.future.map(app => (
                                <div key={app.id} className="card flex items-center justify-between hover-item transition-all">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-primary font-bold">
                                            {new Date(app.date).getDate()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{app.eventType?.name}</h3>
                                            <p className="text-sm text-muted">{new Date(app.date).toLocaleDateString('pt-BR')} às {app.startTime}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="btn btn-outline text-xs px-3 py-2">Reagendar</button>
                                        <button
                                            className="btn text-danger text-xs px-3 py-2 border border-danger/20 hover:bg-danger/5"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <History className="text-muted" size={20} />
                        <h2 className="text-lg font-bold text-muted">Histórico</h2>
                    </div>

                    <div className="grid gap-3">
                        {appointments?.history.map(app => (
                            <div key={app.id} className="p-4 bg-white/50 rounded-lg flex items-center justify-between border border-dashed text-muted">
                                <div className="text-sm">
                                    <span className="font-medium">{app.eventType?.name}</span>
                                    <span className="mx-2">•</span>
                                    <span>{new Date(app.date).toLocaleDateString()}</span>
                                </div>
                                <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${app.status === 'CANCELED' ? 'bg-red-50 text-red-500' : 'bg-slate-100'}`}>
                                    {app.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
