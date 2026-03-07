import { NextRequest, NextResponse } from 'next/server'
import { removeSubscriptionFromDb } from '@/lib/push'

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json()
    if (!endpoint) return NextResponse.json({ error: 'endpoint required' }, { status: 400 })
    const ok = await removeSubscriptionFromDb(endpoint)
    return NextResponse.json({ success: !!ok })
  } catch (err) {
    console.error('[api/push/unsubscribe] error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
