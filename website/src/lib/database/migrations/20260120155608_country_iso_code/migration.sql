-- 1. Rename the column safely
ALTER TABLE "country" RENAME COLUMN "name" TO "iso_code";

-- 2. Drop old unique index if it exists
DROP INDEX IF EXISTS "country_name_key";

-- 3. Add new unique index for renamed column
CREATE UNIQUE INDEX "country_iso_code_key" ON "country"("iso_code");