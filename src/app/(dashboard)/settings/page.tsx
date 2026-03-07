import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SettingsForm from './settings-form'
import PushSubscribe from '@/components/push-subscribe'

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
            language: true
        }
    })

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="card w-full" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Configurações</h2>
            <SettingsForm user={user} />
            <div className="mt-6">
                <PushSubscribe />
            </div>
        </div>
    )
}
