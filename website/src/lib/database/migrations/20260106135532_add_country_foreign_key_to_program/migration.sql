ALTER TABLE "program"
ADD COLUMN "country_id" TEXT,
ADD COLUMN "target_causes" "Cause"[];

UPDATE "program"
SET "country_id" = (
  SELECT id FROM "country" LIMIT 1
)
WHERE "country_id" IS NULL;

ALTER TABLE "program"
ALTER COLUMN "country_id" SET NOT NULL;

ALTER TABLE "program"
ADD CONSTRAINT "program_country_id_fkey"
FOREIGN KEY ("country_id")
REFERENCES "country"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "program"
DROP COLUMN "country";