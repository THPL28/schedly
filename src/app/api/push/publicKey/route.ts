import { NextRequest, NextResponse } from 'next/server'
import { getVapidPublicKey } from '@/lib/push'

export async function GET(request: NextRequest) {
  const publicKey = getVapidPublicKey()
  if (!publicKey) return NextResponse.json({ error: 'VAPID public key not configured' }, { status: 404 })
  return NextResponse.json({ publicKey })
}
