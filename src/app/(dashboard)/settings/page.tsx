import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SettingsForm from './settings-form'

export default async function SettingsPage() {
    const session = await verifySession()
    if (!session) redirect('/login')

    const user = await prisma.user.findUnique({ where: { id: session.userId as string } })

    return (
        <div className="card w-full" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem md:2rem', fontSize: '1.5rem md:2rem' }}>Configurações</h2>
            <SettingsForm user={user} />
        </div>
    )
}
