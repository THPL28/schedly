-- Complete the PostgreSQL schema that was previously only partially represented
-- by the legacy SQLite migration history.

-- User fields
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT,
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "bio" TEXT,
  ADD COLUMN IF NOT EXISTS "website" TEXT,
  ADD COLUMN IF NOT EXISTS "vertical" TEXT NOT NULL DEFAULT 'GENERAL',
  ADD COLUMN IF NOT EXISTS "googleAccessToken" TEXT,
  ADD COLUMN IF NOT EXISTS "googleRefreshToken" TEXT,
  ADD COLUMN IF NOT EXISTS "googleTokenExpiry" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "googleCalendarEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "minLeadTime" INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS "maxFutureDays" INTEGER NOT NULL DEFAULT 30;

CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_slug_key" ON "User"("slug");

-- Subscription fields
ALTER TABLE "Subscription"
  ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
  ADD COLUMN IF NOT EXISTS "stripePriceId" TEXT,
  ADD COLUMN IF NOT EXISTS "maxAppointmentsOverride" INTEGER,
  ADD COLUMN IF NOT EXISTS "emailRemindersOverride" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "customBrandingOverride" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "multipleEventTypesOverride" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "bufferTimeOverride" BOOLEAN;

CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- Appointment fields required by the current schema
ALTER TABLE "Appointment"
  ADD COLUMN IF NOT EXISTS "eventTypeId" TEXT,
  ADD COLUMN IF NOT EXISTS "clientEmail" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "clientPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "cancelToken" TEXT NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS "reminder24hSent" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "reminder1hSent" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "attended" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "googleEventId" TEXT,
  ADD COLUMN IF NOT EXISTS "googleMeetLink" TEXT,
  ADD COLUMN IF NOT EXISTS "clientId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_cancelToken_key" ON "Appointment"("cancelToken");

-- Event types
CREATE TABLE IF NOT EXISTS "EventType" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "duration" INTEGER NOT NULL,
  "price" DECIMAL,
  "bufferTime" INTEGER NOT NULL DEFAULT 0,
  "color" TEXT NOT NULL DEFAULT '#3b82f6',
  "locationType" TEXT NOT NULL DEFAULT 'IN_PERSON',
  "locationAddress" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "EventType_userId_slug_key" ON "EventType"("userId", "slug");
CREATE INDEX IF NOT EXISTS "EventType_userId_idx" ON "EventType"("userId");

-- Availability
CREATE TABLE IF NOT EXISTS "Availability" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS "Availability_userId_idx" ON "Availability"("userId");

CREATE TABLE IF NOT EXISTS "AvailabilityOverride" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "startTime" TEXT,
  "endTime" TEXT
);
CREATE INDEX IF NOT EXISTS "AvailabilityOverride_userId_idx" ON "AvailabilityOverride"("userId");

-- Clients
CREATE TABLE IF NOT EXISTS "Client" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Client_userId_email_key" ON "Client"("userId", "email");
CREATE INDEX IF NOT EXISTS "Client_userId_idx" ON "Client"("userId");
CREATE INDEX IF NOT EXISTS "Client_email_idx" ON "Client"("email");

-- Client notes
CREATE TABLE IF NOT EXISTS "ClientNote" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ClientNote_clientId_idx" ON "ClientNote"("clientId");
CREATE INDEX IF NOT EXISTS "ClientNote_userId_idx" ON "ClientNote"("userId");

-- Appointment cancellations
CREATE TABLE IF NOT EXISTS "AppointmentCancellation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "appointmentId" TEXT NOT NULL UNIQUE,
  "cancelledBy" TEXT NOT NULL,
  "reasonType" TEXT NOT NULL,
  "reasonText" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Foreign keys are added only when they do not already exist.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EventType_userId_fkey') THEN
    ALTER TABLE "EventType" ADD CONSTRAINT "EventType_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Availability_userId_fkey') THEN
    ALTER TABLE "Availability" ADD CONSTRAINT "Availability_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AvailabilityOverride_userId_fkey') THEN
    ALTER TABLE "AvailabilityOverride" ADD CONSTRAINT "AvailabilityOverride_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Client_userId_fkey') THEN
    ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClientNote_clientId_fkey') THEN
    ALTER TABLE "ClientNote" ADD CONSTRAINT "ClientNote_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClientNote_userId_fkey') THEN
    ALTER TABLE "ClientNote" ADD CONSTRAINT "ClientNote_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Appointment_eventTypeId_fkey') THEN
    ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_eventTypeId_fkey"
      FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Appointment_clientId_fkey') THEN
    ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AppointmentCancellation_appointmentId_fkey') THEN
    ALTER TABLE "AppointmentCancellation" ADD CONSTRAINT "AppointmentCancellation_appointmentId_fkey"
      FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
