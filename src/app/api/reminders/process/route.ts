import { NextRequest, NextResponse } from 'next/server'
import { processDueReminders } from '@/lib/reminders'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-reminder-secret') || request.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.REMINDER_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const results = await processDueReminders()
    return NextResponse.json({ success: true, processed: results.length, results })
  } catch (err) {
    console.error('[api/reminders/process] error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
