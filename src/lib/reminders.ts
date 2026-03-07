import { prisma } from './prisma'
import { sendMail } from './email'

type ReminderResult = { id: string; sent: boolean; reason?: string; previewUrl?: string | null }

const MINUTES_IN_HOUR = 60
const MINUTES_IN_24H = 24 * MINUTES_IN_HOUR

export async function processDueReminders() {
  const now = new Date()
  const appts = await prisma.appointment.findMany({
    where: {
      status: 'SCHEDULED',
      OR: [{ reminder24hSent: false }, { reminder1hSent: false }],
    },
    include: { user: true },
  })

  const results: ReminderResult[] = []

  for (const appt of appts) {
    try {
      const [hh, mm] = appt.startTime.split(':').map((s) => Number(s))
      const dateOnly = new Date(appt.date)
      const scheduled = new Date(dateOnly.getFullYear(), dateOnly.getMonth(), dateOnly.getDate(), hh, mm, 0)
      const minutesUntil = Math.round((scheduled.getTime() - now.getTime()) / 60000)

      if (minutesUntil < 0) {
        continue
      }

      let reminderType: '24h' | '1h' | null = null
      if (!appt.reminder1hSent && minutesUntil <= MINUTES_IN_HOUR) {
        reminderType = '1h'
      } else if (!appt.reminder24hSent && minutesUntil <= MINUTES_IN_24H) {
        reminderType = '24h'
      }

      if (!reminderType) {
        continue
      }

      const userEmail = appt.user?.email
      if (!userEmail) {
        results.push({ id: appt.id, sent: false, reason: 'no-recipient' })
        continue
      }

      const when = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
      const dateStr = scheduled.toLocaleDateString('pt-BR')
      const label = reminderType === '1h' ? 'em 1 hora' : 'em 24 horas'
      const subject = `Lembrete ${label}: compromisso as ${when} em ${dateStr}`
      const text = `Ola ${appt.user?.name || ''},\n\nVoce tem um compromisso com ${appt.clientName} ${label} (${dateStr} as ${when}).\n\nAcesse sua agenda: ${(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000')}/dashboard`

      const { preview } = await sendMail({ to: userEmail, subject, text })

      await prisma.appointment.update({
        where: { id: appt.id },
        data: reminderType === '1h' ? { reminder1hSent: true } : { reminder24hSent: true },
      })

      results.push({ id: appt.id, sent: true, previewUrl: preview || null })
    } catch (err: unknown) {
      results.push({ id: appt.id, sent: false, reason: String((err as Error)?.message || err) })
    }
  }

  return results
}
