import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await verifySession()
  if (!session || typeof session.userId !== 'string') return NextResponse.redirect(new URL('/login', request.url))

  const form = await request.formData()
  const vertical = String(form.get('vertical') || '')
  if (!['GENERAL', 'MEDICAL'].includes(vertical)) {
    return NextResponse.json({ error: 'Área profissional inválida.' }, { status: 400 })
  }

  try {
    await prisma.$executeRaw`UPDATE "User" SET vertical = ${vertical}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ${session.userId}`
    if (vertical === 'MEDICAL') {
      await prisma.$executeRaw`
        INSERT INTO "MedicalProfile" ("id", "userId")
        VALUES (${crypto.randomUUID()}, ${session.userId})
        ON CONFLICT ("userId") DO NOTHING
      `
    }
    return NextResponse.redirect(new URL('/settings/medical', request.url))
  } catch (error) {
    console.error('[settings.vertical]', error)
    return NextResponse.json({ error: 'Não foi possível atualizar seu perfil profissional.' }, { status: 500 })
  }
}
