import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PushSubscribe from '@/components/push-subscribe'
import SettingsForm from '@/app/(dashboard)/settings/settings-form'

export default async function SettingsPage() {
    const session = await verifySession()
    if (!session) redirect('/login')

    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            phone: true,
            bio: true,
            website: true,
            slug: true,
            language: true,
            googleCalendarEnabled: true,
            googleAccessToken: true,
            minLeadTime: true,
            maxFutureDays: true,
        },
    })

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="w-full space-y-6" style={{ maxWidth: '1000px', margin: '0px auto' }}>
            <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">Configurações</h2>
                <p className="max-w-2xl text-sm font-medium text-muted md:text-base">
                    Ajuste sua identidade visual, regras da agenda, integrações e preferências de comunicação em um só lugar.
                </p>
            </div>

            <Suspense fallback={<div className="h-[400px] animate-pulse rounded-3xl bg-slate-50" />}>
                <SettingsForm user={user} />
            </Suspense>

            <PushSubscribe />
        </div>
    )
}
