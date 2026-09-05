import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export type ClinicalEncounterInput = {
  userId: string
  clientId: string
  appointmentId?: string
  occurredAt?: string
  chiefComplaint?: string
  anamnesis?: string
  physicalExam?: string
  assessment?: string
  conduct?: string
  notes?: string
}

export async function getClinicalPatient(userId: string, clientId: string) {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT c.id, c.name, c.email, c.phone, c."createdAt", u.vertical,
           p."birthDate", p.sex, p.cpf, p.allergies, p."currentMedications",
           p."relevantConditions", p."emergencyContact"
    FROM "Client" c
    JOIN "User" u ON u.id = ${userId}
    LEFT JOIN "PatientMedicalProfile" p ON p."clientId" = c.id AND p."userId" = ${userId}
    WHERE c.id = ${clientId} AND c."userId" = ${userId}
    LIMIT 1
  `
  if (!rows[0]) return null

  const appointments = await prisma.$queryRaw<any[]>`
    SELECT a.id, a.date, a."startTime", a."endTime", a.status, a.attended,
           e.name AS "eventTypeName"
    FROM "Appointment" a
    LEFT JOIN "EventType" e ON e.id = a."eventTypeId"
    WHERE a."userId" = ${userId} AND a."clientId" = ${clientId}
    ORDER BY a.date DESC, a."startTime" DESC
    LIMIT 50
  `

  const encounters = await prisma.$queryRaw<any[]>`
    SELECT ce.id, ce."occurredAt", ce."chiefComplaint", ce.anamnesis,
           ce."physicalExam", ce.assessment, ce.conduct, ce.notes,
           ce."appointmentId", ce."createdAt", ce."updatedAt"
    FROM "ClinicalEncounter" ce
    WHERE ce."userId" = ${userId} AND ce."clientId" = ${clientId}
    ORDER BY ce."occurredAt" DESC
    LIMIT 50
  `

  return { patient: rows[0], appointments, encounters }
}

export async function createClinicalEncounter(input: ClinicalEncounterInput) {
  const appointment = input.appointmentId
    ? (await prisma.$queryRaw<any[]>`
        SELECT id FROM "Appointment"
        WHERE id = ${input.appointmentId} AND "userId" = ${input.userId} AND "clientId" = ${input.clientId}
        LIMIT 1
      `)[0]
    : null

  const client = (await prisma.$queryRaw<any[]>`
    SELECT id FROM "Client" WHERE id = ${input.clientId} AND "userId" = ${input.userId} LIMIT 1
  `)[0]
  if (!client) throw new Error('CLIENT_NOT_FOUND')
  if (input.appointmentId && !appointment) throw new Error('APPOINTMENT_NOT_FOUND')

  const id = randomUUID()
  await prisma.$executeRaw`
    INSERT INTO "ClinicalEncounter"
      ("id", "userId", "clientId", "appointmentId", "occurredAt", "chiefComplaint", "anamnesis", "physicalExam", "assessment", "conduct", "notes")
    VALUES
      (${id}, ${input.userId}, ${input.clientId}, ${input.appointmentId || null}, ${input.occurredAt ? new Date(input.occurredAt) : new Date()},
       ${input.chiefComplaint || null}, ${input.anamnesis || null}, ${input.physicalExam || null}, ${input.assessment || null}, ${input.conduct || null}, ${input.notes || null})
  `

  await prisma.$executeRaw`
    INSERT INTO "ClinicalAuditLog" ("id", "userId", "clientId", "encounterId", "action")
    VALUES (${randomUUID()}, ${input.userId}, ${input.clientId}, ${id}, 'CREATE_ENCOUNTER')
  `

  if (appointment) {
    await prisma.$executeRaw`
      UPDATE "Appointment" SET attended = true, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = ${input.appointmentId} AND "userId" = ${input.userId}
    `
  }

  return id
}
