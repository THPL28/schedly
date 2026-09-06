ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vertical" TEXT NOT NULL DEFAULT 'GENERAL';

CREATE TABLE IF NOT EXISTS "MedicalProfile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "specialty" TEXT,
  "crm" TEXT,
  "crmState" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MedicalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "PatientMedicalProfile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientId" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL,
  "birthDate" TIMESTAMP(3),
  "sex" TEXT,
  "cpf" TEXT,
  "allergies" TEXT,
  "currentMedications" TEXT,
  "relevantConditions" TEXT,
  "emergencyContact" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PatientMedicalProfile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PatientMedicalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "PatientMedicalProfile_userId_idx" ON "PatientMedicalProfile"("userId");

CREATE TABLE IF NOT EXISTS "ClinicalEncounter" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "appointmentId" TEXT UNIQUE,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "chiefComplaint" TEXT,
  "anamnesis" TEXT,
  "physicalExam" TEXT,
  "assessment" TEXT,
  "conduct" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClinicalEncounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClinicalEncounter_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClinicalEncounter_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ClinicalEncounter_user_client_date_idx" ON "ClinicalEncounter"("userId", "clientId", "occurredAt");
CREATE INDEX IF NOT EXISTS "ClinicalEncounter_client_date_idx" ON "ClinicalEncounter"("clientId", "occurredAt");

CREATE TABLE IF NOT EXISTS "ClinicalAuditLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "clientId" TEXT,
  "encounterId" TEXT,
  "action" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClinicalAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClinicalAuditLog_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "ClinicalEncounter"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ClinicalAuditLog_user_created_idx" ON "ClinicalAuditLog"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "ClinicalAuditLog_client_created_idx" ON "ClinicalAuditLog"("clientId", "createdAt");
CREATE INDEX IF NOT EXISTS "ClinicalAuditLog_encounter_created_idx" ON "ClinicalAuditLog"("encounterId", "createdAt");