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
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card">
                    <div className="label">Total Users</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalUsers}</div>
                </div>
                <div className="card">
                    <div className="label">Total Appointments</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalAppointments}</div>
                </div>
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--muted-light)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>User</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Plan Status</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Trial Ends</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Appts</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                                    <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{u.email}</div>
                                    <div style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>Since {new Date(u.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        background: u.subscription?.status === 'ACTIVE' ? 'var(--success)' :
                                            u.subscription?.status === 'TRIAL' ? 'var(--secondary)' :
                                                u.subscription?.status === 'EXPIRED' ? 'var(--danger)' : 'var(--muted)',
                                        color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem'
                                    }}>
                                        {u.subscription?.status || 'NONE'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {u.subscription?.trialEndDate ? new Date(u.subscription.trialEndDate).toLocaleDateString() : '-'}
                                </td>
                                <td style={{ padding: '1rem' }}>{u._count.appointments}</td>
                                <td style={{ padding: '1rem' }}>
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
