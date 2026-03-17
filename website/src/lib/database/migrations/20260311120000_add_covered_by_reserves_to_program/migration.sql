ALTER TABLE "program"
ADD COLUMN "covered_by_reserves" BOOLEAN DEFAULT false;

UPDATE "program"
SET "covered_by_reserves" = COALESCE("covered_by_reserves", false);

ALTER TABLE "program"
ALTER COLUMN "covered_by_reserves" SET NOT NULL;
