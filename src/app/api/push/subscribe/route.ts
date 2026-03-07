import { NextRequest, NextResponse } from 'next/server'
import { saveSubscriptionToDb } from '@/lib/push'
import { verifySession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body || !body.endpoint) return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })

    const session = await verifySession()
    const userId = typeof session?.userId === 'string' ? session.userId : null
    await saveSubscriptionToDb(body, userId)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/push/subscribe] error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
