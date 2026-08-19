-- AlterTable
ALTER TABLE "campaign" ADD COLUMN "is_default" BOOLEAN NOT NULL DEFAULT false;

-- Backfill defaults from campaign titles
UPDATE "campaign"
SET "is_default" = true
WHERE "title" ILIKE '%Default%';
