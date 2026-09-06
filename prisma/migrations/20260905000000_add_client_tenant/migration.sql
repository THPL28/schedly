-- Make Client tenant-aware without losing existing appointment history.
-- The base PostgreSQL migration now creates Client with userId, so all schema
-- changes here are idempotent while the data backfill remains preserved.

ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "userId" TEXT;

UPDATE "Client" c
SET "userId" = owners."userId"
FROM (
  SELECT "clientId", MIN("userId") AS "userId"
  FROM "Appointment"
  WHERE "clientId" IS NOT NULL
  GROUP BY "clientId"
) owners
WHERE c."id" = owners."clientId"
  AND c."userId" IS NULL;

DROP INDEX IF EXISTS "Client_email_key";

DO $$
DECLARE
  item RECORD;
  new_client_id TEXT;
BEGIN
  FOR item IN
    SELECT c."id" AS "clientId", a."userId"
    FROM "Client" c
    JOIN (
      SELECT DISTINCT "clientId", "userId"
      FROM "Appointment"
      WHERE "clientId" IS NOT NULL
    ) a ON a."clientId" = c."id"
    WHERE c."userId" IS DISTINCT FROM a."userId"
  LOOP
    new_client_id := 'c' || md5(item."clientId" || ':' || item."userId" || ':' || clock_timestamp()::text);

    INSERT INTO "Client" ("id", "userId", "email", "name", "phone", "createdAt", "updatedAt")
    SELECT new_client_id, item."userId", c."email", c."name", c."phone", c."createdAt", c."updatedAt"
    FROM "Client" c
    WHERE c."id" = item."clientId";

    UPDATE "Appointment"
    SET "clientId" = new_client_id
    WHERE "clientId" = item."clientId"
      AND "userId" = item."userId";
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Client_userId_fkey') THEN
    ALTER TABLE "Client"
      ADD CONSTRAINT "Client_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "Client_userId_email_key" ON "Client"("userId", "email");
CREATE INDEX IF NOT EXISTS "Client_userId_idx" ON "Client"("userId");
CREATE INDEX IF NOT EXISTS "Client_email_idx" ON "Client"("email");
