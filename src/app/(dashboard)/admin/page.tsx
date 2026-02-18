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
            <h1 style={{ marginBottom: '1.5rem sm:2rem', fontSize: '1.5rem sm:2rem' }}>Admin Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem sm:2rem', marginBottom: '1.5rem sm:2rem' }}>
                <div className="card p-4 sm:p-6">
                    <div className="label" style={{ fontSize: '0.7rem sm:0.75rem' }}>Total Users</div>
                    <div style={{ fontSize: '1.5rem sm:2rem', fontWeight: 700 }}>{totalUsers}</div>
                </div>
                <div className="card p-4 sm:p-6">
                    <div className="label" style={{ fontSize: '0.7rem sm:0.75rem' }}>Total Appointments</div>
                    <div style={{ fontSize: '1.5rem sm:2rem', fontWeight: 700 }}>{totalAppointments}</div>
                </div>
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem sm:0.875rem', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ background: 'var(--muted-light)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem sm:1rem', borderBottom: '1px solid var(--border)', fontSize: '0.7rem sm:0.75rem' }}>User</th>
                            <th style={{ padding: '0.75rem sm:1rem', borderBottom: '1px solid var(--border)', fontSize: '0.7rem sm:0.75rem' }}>Plan Status</th>
                            <th style={{ padding: '0.75rem sm:1rem', borderBottom: '1px solid var(--border)', fontSize: '0.7rem sm:0.75rem' }}>Trial Ends</th>
                            <th style={{ padding: '0.75rem sm:1rem', borderBottom: '1px solid var(--border)', fontSize: '0.7rem sm:0.75rem' }}>Appts</th>
                            <th style={{ padding: '0.75rem sm:1rem', borderBottom: '1px solid var(--border)', fontSize: '0.7rem sm:0.75rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '0.75rem sm:1rem' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem sm:1rem' }}>{u.name}</div>
                                    <div style={{ color: 'var(--muted)', fontSize: '0.7rem sm:0.75rem' }}>{u.email}</div>
                                    <div style={{ color: 'var(--muted)', fontSize: '0.65rem sm:0.7rem' }}>Since {new Date(u.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td style={{ padding: '0.75rem sm:1rem' }}>
                                    <span style={{
                                        background: u.subscription?.status === 'ACTIVE' ? 'var(--success)' :
                                            u.subscription?.status === 'TRIAL' ? 'var(--secondary)' :
                                                u.subscription?.status === 'EXPIRED' ? 'var(--danger)' : 'var(--muted)',
                                        color: 'white', padding: '2px 6px sm:8px', borderRadius: '12px', fontSize: '0.7rem sm:0.75rem'
                                    }}>
                                        {u.subscription?.status || 'NONE'}
                                    </span>
                                </td>
                                <td style={{ padding: '0.75rem sm:1rem', fontSize: '0.75rem sm:0.875rem' }}>
                                    {u.subscription?.trialEndDate ? new Date(u.subscription.trialEndDate).toLocaleDateString() : '-'}
                                </td>
                                <td style={{ padding: '0.75rem sm:1rem', fontSize: '0.875rem sm:1rem' }}>{u._count.appointments}</td>
                                <td style={{ padding: '0.75rem sm:1rem' }}>
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
