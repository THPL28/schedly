import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SettingsForm from './settings-form'

export default async function SettingsPage() {
    const session = await verifySession()
    if (!session) redirect('/login')

    const user = await prisma.user.findUnique({ where: { id: session.userId as string } })

    return (
        <div className="card" style={{ maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '2rem' }}>Settings</h2>
            <SettingsForm user={user} />
        </div>
    )
}
