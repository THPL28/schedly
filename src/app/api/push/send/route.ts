import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPushToSubscription } from '@/lib/push'

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { userId, title, body: msg } = body || {}
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

    // Only admins can send arbitrary notifications; normal users may only send to themselves
    if (userId && userId !== session.userId) {
      const admin = await prisma.user.findUnique({ where: { id: session.userId as string } })
      if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const targetUserId = userId || session.userId
    const subs = await prisma.pushSubscription.findMany({ where: { userId: targetUserId as string } })
    const payload = { title, body: msg || '', data: { url: '/dashboard' } }
    const results = await Promise.all(subs.map(s => sendPushToSubscription({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload)))
    return NextResponse.json({ success: true, sent: results.filter(Boolean).length })
  } catch (err) {
    console.error('[api/push/send] error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
