import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BookingForm from './booking-form'
import { ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PublicBookingPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ date?: string }> }) {
    const resolvedParams = await params
    const resolvedSearchParams = await searchParams

    const user = await prisma.user.findFirst({
        where: { slug: resolvedParams.slug },
    })

    if (!user) notFound()

    const dateStr = resolvedSearchParams.date || new Date().toISOString().split('T')[0]
    const startOfDay = new Date(dateStr + 'T00:00:00.000Z')
    const endOfDay = new Date(dateStr + 'T23:59:59.999Z')

    const busyAppointments = await prisma.appointment.findMany({
        where: {
            userId: user.id,
            date: {
                gte: startOfDay,
                lte: endOfDay
            },
            status: 'SCHEDULED'
        }
    })

    return (
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-5 font-sans">
            <div className="w-full max-w-[850px] bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-4 p-4 border-b border-border">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {user.name?.[0]}
                    </div>
                    <div className="flex-1">
                        <h1 className="m-0 text-lg font-normal text-foreground">{user.name}</h1>
                        <p className="m-0 text-xs text-muted">Agendar Novo Evento</p>
                    </div>
                    <div className="flex items-center gap-2 text-muted text-xs">
                        <ShieldCheck size={16} />
                        <span>Verificado</span>
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-white">
                    <BookingForm
                        key={dateStr}
                        providerId={user.id}
                        initialDate={dateStr}
                        busyAppointments={busyAppointments}
                    />
                </div>
            </div>

            <div className="fixed bottom-4 right-6 text-[11px] text-muted">
                Plataforma Schedly
            </div>
        </div>
    )
}
