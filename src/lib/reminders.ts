import { prisma } from './prisma'
import { sendMail } from './email'

export async function processDueReminders() {
  const now = new Date()
  // find appointments that have a reminder configured and not yet sent
  const appts = await prisma.appointment.findMany({
    where: { reminderMinutesBefore: { not: null }, reminderSentAt: null },
    include: { user: true },
  })

  const results: { id: string; sent: boolean; reason?: string; previewUrl?: string | null }[] = []

  for (const a of appts) {
    try {
      const [hh, mm] = a.startTime.split(':').map((s) => Number(s))
      // appointment.date is stored at 00:00:00 UTC for the date; build a local Date for the start time
      const dateOnly = new Date(a.date)
      const scheduled = new Date(dateOnly.getFullYear(), dateOnly.getMonth(), dateOnly.getDate(), hh, mm, 0)

      const reminderMs = (a.reminderMinutesBefore || 0) * 60 * 1000
      const reminderAt = new Date(scheduled.getTime() - reminderMs)

      // If it's time (or late) to send the reminder, send it
      if (reminderAt <= now) {
        const userEmail = a.user?.email
        if (!userEmail) {
          results.push({ id: a.id, sent: false, reason: 'no-recipient' })
          continue
        }

        const when = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
        const dateStr = scheduled.toLocaleDateString('pt-BR')
        const subject = `Lembrete: compromisso às ${when} em ${dateStr}`
        const text = `Olá ${a.user?.name || ''},\n\nVocê tem um compromisso com ${a.clientName} em ${dateStr} às ${when}.\n\nAcesse sua agenda: ${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard`

        const { info, preview } = await sendMail({ to: userEmail, subject, text })
        // mark as sent
        await prisma.appointment.update({ where: { id: a.id }, data: { reminderSentAt: new Date() } })
        results.push({ id: a.id, sent: true, previewUrl: preview || null })
      }
    } catch (err: any) {
      results.push({ id: a.id, sent: false, reason: String(err?.message || err) })
    }
  }

  return results
}
