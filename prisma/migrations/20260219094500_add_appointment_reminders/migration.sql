-- AlterTable: add reminder fields to Appointment
ALTER TABLE "Appointment"
ADD COLUMN IF NOT EXISTS "reminderMinutesBefore" INTEGER,
ADD COLUMN IF NOT EXISTS "reminderSentAt" DATETIME;