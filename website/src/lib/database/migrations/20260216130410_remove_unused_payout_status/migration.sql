BEGIN;

UPDATE "payout"
SET "status" = 'paid'
WHERE "status" IN ('created', 'other');

CREATE TYPE "PayoutStatus_new" AS ENUM (
  'paid',
  'confirmed',
  'contested',
  'failed'
);

ALTER TABLE "payout"
ALTER COLUMN "status"
TYPE "PayoutStatus_new"
USING ("status"::text::"PayoutStatus_new");

ALTER TYPE "PayoutStatus" RENAME TO "PayoutStatus_old";
ALTER TYPE "PayoutStatus_new" RENAME TO "PayoutStatus";

DROP TYPE "public"."PayoutStatus_old";

COMMIT;