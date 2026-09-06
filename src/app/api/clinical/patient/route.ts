import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await verifySession()
  if (!session || typeof session.userId !== 'string') return NextResponse.redirect(new URL('/login', request.url))

  const userId = session.userId
  const form = await request.formData()
  const clientId = String(form.get('clientId') || '')
  if (!clientId) return NextResponse.json({ error: 'Paciente inválido.' }, { status: 400 })

  const client = await prisma.client.findFirst({ where: { id: clientId, userId }, select: { id: true } })
  if (!client) return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 })

  const birthDateRaw = String(form.get('birthDate') || '')
  const birthDate = birthDateRaw ? new Date(`${birthDateRaw}T12:00:00.000Z`) : null
  if (birthDate && Number.isNaN(birthDate.getTime())) return NextResponse.json({ error: 'Data de nascimento inválida.' }, { status: 400 })

  await prisma.$transaction(async (tx) => {
    await tx.patientMedicalProfile.upsert({
      where: { clientId },
      create: {
        clientId,
        userId,
        birthDate,
        sex: String(form.get('sex') || '').trim() || null,
        cpf: String(form.get('cpf') || '').trim() || null,
        allergies: String(form.get('allergies') || '').trim() || null,
        currentMedications: String(form.get('currentMedications') || '').trim() || null,
        relevantConditions: String(form.get('relevantConditions') || '').trim() || null,
        emergencyContact: String(form.get('emergencyContact') || '').trim() || null,
      },
      update: {
        birthDate,
        sex: String(form.get('sex') || '').trim() || null,
        cpf: String(form.get('cpf') || '').trim() || null,
        allergies: String(form.get('allergies') || '').trim() || null,
        currentMedications: String(form.get('currentMedications') || '').trim() || null,
        relevantConditions: String(form.get('relevantConditions') || '').trim() || null,
        emergencyContact: String(form.get('emergencyContact') || '').trim() || null,
      },
    })

    await tx.clinicalAuditLog.create({
      data: { userId, clientId, action: 'UPDATE_PATIENT_PROFILE' },
    })
  })

  return NextResponse.redirect(new URL(`/clients/${clientId}?saved=patient`, request.url))
}
