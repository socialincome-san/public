-- AlterTable
ALTER TABLE "reserve" ADD COLUMN "date" DATE;

-- Backfill from created_at for any existing rows
UPDATE "reserve"
SET "date" = (("created_at" AT TIME ZONE 'UTC')::date)
WHERE "date" IS NULL;

-- Keep one row per (bank_account_id, date) before unique index
WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "bank_account_id", "date"
      ORDER BY "created_at" ASC NULLS LAST, "id" ASC
    ) AS "rn"
  FROM "reserve"
)
DELETE FROM "reserve" AS "r"
USING ranked AS "ranked"
WHERE "r"."id" = "ranked"."id"
  AND "ranked"."rn" > 1;

ALTER TABLE "reserve" ALTER COLUMN "date" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "reserve_bank_account_id_date_key" ON "reserve"("bank_account_id", "date");
