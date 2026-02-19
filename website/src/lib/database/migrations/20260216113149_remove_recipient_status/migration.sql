BEGIN;

ALTER TABLE "recipient"
  ADD COLUMN "suspended_at" TIMESTAMPTZ(3),
  ADD COLUMN "suspension_reason" TEXT;

UPDATE "recipient"
SET "suspended_at" = NOW()
WHERE "status" = 'suspended';

ALTER TABLE "recipient"
  DROP COLUMN "status";

DROP TYPE IF EXISTS "RecipientStatus";

COMMIT;