import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/auth'
import { notifyUserById } from '@/lib/push'

function toMins(t: string) { const [h, m] = t.split(':').map(Number); return h * 60 + m }

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const type = payload?.type || 'public'

    const date = payload?.date
    const startTime = payload?.startTime
    const endTime = payload?.endTime
    const clientName = payload?.clientName

    if (!date || !startTime || !endTime || !clientName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const startMins = toMins(startTime)
    const endMins = toMins(endTime)
    if (startMins >= endMins) return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })

    const targetDate = new Date(date + 'T00:00:00.000Z')

    if (type === 'private') {
      const session = await verifySession()
      if (!session || !session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const existing = await prisma.appointment.findMany({ where: { userId: session.userId as string, date: targetDate, status: 'SCHEDULED' } })
      if (existing.some(a => startMins < toMins(a.endTime) && toMins(a.startTime) < endMins)) {
        return NextResponse.json({ error: 'Time not available' }, { status: 409 })
      }

      await prisma.appointment.create({ data: { userId: session.userId as string, date: targetDate, startTime, endTime, clientName } })
      // notify owner (self)
      try { await notifyUserById(session.userId as string, { title: 'Agendamento criado (offline)', body: `${clientName} — ${startTime}`, data: { url: '/dashboard' } }) } catch { /* ignore */ }
      return NextResponse.json({ success: true })
    }

    // public booking (providerId required)
    const providerId = payload?.providerId
    if (!providerId) return NextResponse.json({ error: 'providerId required for public booking' }, { status: 400 })

    const existing = await prisma.appointment.findMany({ where: { userId: providerId, date: targetDate, status: 'SCHEDULED' } })
    if (existing.some(a => startMins < toMins(a.endTime) && toMins(a.startTime) < endMins)) {
      return NextResponse.json({ error: 'Time not available' }, { status: 409 })
    }

    await prisma.appointment.create({ data: { userId: providerId, date: targetDate, startTime, endTime, clientName } })
    // notify provider
    try { await notifyUserById(providerId, { title: 'Novo agendamento', body: `${clientName} — ${startTime}`, data: { url: '/dashboard' } }) } catch { /* ignore */ }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/offline/appointments] error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
