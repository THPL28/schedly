import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminActions from './admin-actions'

export default async function AdminPage() {
    const session = await verifySession()
    if (!session) redirect('/login')

    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        select: { role: true }
    })

    // Role check
    if (user?.role !== 'ADMIN') {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <h1 className="text-xl font-bold mb-4">Access Denied</h1>
                    <p>You do not have permission to view this page. This area is restricted to administrators.</p>
                </div>
            </div>
        )
    }

    // Fetch Users
    const users = await prisma.user.findMany({
        include: {
            subscription: true,
            _count: { select: { appointments: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    const totalUsers = users.length
    const totalAppointments = await prisma.appointment.count()

    return (
        <div className="p-4 sm:p-6">
            <h1 className="mb-6 sm:mb-8 text-xl sm:text-2xl font-bold">Admin Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                <div className="card p-4 sm:p-6">
                    <div className="label text-xs sm:text-sm">Total Users</div>
                    <div className="text-2xl sm:text-3xl font-extrabold">{totalUsers}</div>
                </div>
                <div className="card p-4 sm:p-6">
                    <div className="label text-xs sm:text-sm">Total Appointments</div>
                    <div className="text-2xl sm:text-3xl font-extrabold">{totalAppointments}</div>
                </div>
            </div>

            <div className="card overflow-x-auto p-0">
                <table className="w-full border-collapse text-xs sm:text-sm min-w-[600px]">
                    <thead>
                        <tr className="bg-muted-light text-left">
                            <th className="py-3 px-4 border-b border-border text-xs sm:text-sm">User</th>
                            <th className="py-3 px-4 border-b border-border text-xs sm:text-sm">Plan Status</th>
                            <th className="py-3 px-4 border-b border-border text-xs sm:text-sm">Trial Ends</th>
                            <th className="py-3 px-4 border-b border-border text-xs sm:text-sm">Appts</th>
                            <th className="py-3 px-4 border-b border-border text-xs sm:text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="border-b border-border">
                                <td className="py-3 px-4">
                                    <div className="font-semibold text-sm sm:text-base">{u.name}</div>
                                    <div className="text-xs sm:text-sm text-muted">{u.email}</div>
                                    <div className="text-[0.65rem] sm:text-[0.7rem] text-muted">Since {new Date(u.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={"inline-block rounded-full px-2 py-0.5 text-xs sm:text-sm font-semibold " + (u.subscription?.status === 'ACTIVE' ? 'bg-success text-white' : u.subscription?.status === 'TRIAL' ? 'bg-secondary text-white' : u.subscription?.status === 'EXPIRED' ? 'bg-danger text-white' : 'bg-muted text-white')}>
                                        {u.subscription?.status || 'NONE'}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-xs sm:text-sm">
                                    {u.subscription?.trialEndDate ? new Date(u.subscription.trialEndDate).toLocaleDateString() : '-'}
                                </td>
                                <td className="py-3 px-4 text-sm sm:text-base">{u._count.appointments}</td>
                                <td className="py-3 px-4">
                                    <AdminActions userId={u.id} currentStatus={u.subscription?.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
