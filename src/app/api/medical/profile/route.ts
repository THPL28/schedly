import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await verifySession()
  if (!session || typeof session.userId !== 'string') return NextResponse.redirect(new URL('/login', request.url))

  const userId = session.userId
  const form = await request.formData()
  const vertical = String(form.get('vertical') || 'GENERAL')
  const specialty = String(form.get('specialty') || '').trim() || null
  const crm = String(form.get('crm') || '').trim() || null
  const crmState = String(form.get('crmState') || '').trim().toUpperCase() || null

  if (!['GENERAL', 'MEDICAL', 'PSYCHOLOGY', 'DENTISTRY', 'NUTRITION', 'PHYSIOTHERAPY', 'THERAPY', 'CONSULTING'].includes(vertical)) {
    return NextResponse.json({ error: 'Profissão inválida.' }, { status: 400 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { vertical } })
    if (vertical === 'MEDICAL') {
      await tx.medicalProfile.upsert({
        where: { userId },
        create: { userId, specialty, crm, crmState },
        update: { specialty, crm, crmState },
      })
    }
  })

  return NextResponse.redirect(new URL('/settings/professional?saved=1', request.url))
}
