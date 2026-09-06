import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { createClinicalEncounter } from '@/services/clinicalService'

export async function POST(request: Request) {
  const session = await verifySession()
  if (!session || typeof session.userId !== 'string') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const userId = session.userId
  const form = await request.formData()
  const clientId = String(form.get('clientId') || '')
  if (!clientId) return NextResponse.json({ error: 'Paciente inválido.' }, { status: 400 })

  try {
    const id = await createClinicalEncounter({
      userId,
      clientId,
      appointmentId: String(form.get('appointmentId') || '') || undefined,
      occurredAt: String(form.get('occurredAt') || '') || undefined,
      chiefComplaint: String(form.get('chiefComplaint') || '') || undefined,
      anamnesis: String(form.get('anamnesis') || '') || undefined,
      physicalExam: String(form.get('physicalExam') || '') || undefined,
      assessment: String(form.get('assessment') || '') || undefined,
      conduct: String(form.get('conduct') || '') || undefined,
      notes: String(form.get('notes') || '') || undefined,
    })
    return NextResponse.redirect(new URL(`/clients/${clientId}?encounter=${id}`, request.url))
  } catch (error) {
    console.error('[clinical.encounters.create]', error)
    return NextResponse.json({ error: 'Não foi possível registrar o atendimento.' }, { status: 500 })
  }
}
