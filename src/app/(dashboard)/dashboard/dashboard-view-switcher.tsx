'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Timeline from '../schedule/timeline'
import PerformanceChart from '@/components/dashboard/performance-chart'
import { Calendar, Clock, Settings, CheckCircle2, ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'

export default function DashboardViewSwitcher({
    user,
    dateStr,
    status,
    serializedAppts,
    isToday
}: any) {
    const searchParams = useSearchParams()
    const activeTab = searchParams.get('tab') || 'agenda'
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => setIsMounted(true), [])

    if (!isMounted) return null

    return (
        <div className="dashboard-content">
            {activeTab === 'agenda' && (
                <section className="dashboard-agenda-card">
                    <div className="dashboard-section-header">
                        <div>
                            <p className="dashboard-section-eyebrow">Agenda</p>
                            <h2>{isToday ? 'Compromissos de hoje' : 'Compromissos do dia'}</h2>
                        </div>
                        <div className="dashboard-section-actions">
                            <Link href="/schedule?new=true" className="dashboard-primary-action">
                                <Plus size={16} /> Novo agendamento
                            </Link>
                            <Link href="/calendar" className="dashboard-secondary-action">
                                Calendário <ArrowRight size={15} />
                            </Link>
                        </div>
                    </div>

                    <div className="dashboard-agenda-meta">
                        <span className="dashboard-live-dot" />
                        <span>{status === 'SCHEDULED' ? 'Agendamentos confirmados' : 'Agendamentos cancelados'}</span>
                        <span className="dashboard-meta-separator">•</span>
                        <span>{serializedAppts.length} {serializedAppts.length === 1 ? 'registro' : 'registros'}</span>
                    </div>

                    <div className="dashboard-timeline-wrap">
                        <Timeline date={dateStr} appointments={serializedAppts} />
                    </div>
                </section>
            )}

            {activeTab === 'analytics' && (
                <section className="dashboard-analytics-view">
                    <PerformanceChart />
                </section>
            )}

            {activeTab === 'disponibilidade' && (
                <section className="dashboard-availability-view">
                    <div className="dashboard-availability-copy">
                        <span className="dashboard-availability-icon"><Clock size={20} /></span>
                        <p className="dashboard-section-eyebrow">Disponibilidade</p>
                        <h2>Controle quando você pode atender.</h2>
                        <p>Defina horários recorrentes, pausas e exceções para manter sua agenda sempre atualizada.</p>
                        <Link href="/settings/availability" className="dashboard-primary-action">
                            Configurar horários <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="dashboard-availability-list">
                        {['Segunda', 'Terça', 'Quarta', 'Quinta'].map((day, index) => (
                            <div key={day} className={`dashboard-day-row ${index === 2 ? 'is-off' : ''}`}>
                                <span>{day}</span>
                                <strong>{index === 2 ? 'Folga' : index === 3 ? '09:00 – 20:00' : '09:00 – 18:00'}</strong>
                                <CheckCircle2 size={16} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {activeTab === 'servicos' && (
                <section className="dashboard-services-view">
                    <div className="dashboard-services-icon"><Settings size={22} /></div>
                    <p className="dashboard-section-eyebrow">Serviços</p>
                    <h2>Organize o que você oferece.</h2>
                    <p>Crie serviços com duração, preço e informações que deixam o agendamento mais simples para seus clientes.</p>
                    <div className="dashboard-section-actions dashboard-services-actions">
                        <Link href="/settings/event-types" className="dashboard-primary-action">Gerenciar serviços <ArrowRight size={16} /></Link>
                    </div>
                </section>
            )}
        </div>
    )
}
