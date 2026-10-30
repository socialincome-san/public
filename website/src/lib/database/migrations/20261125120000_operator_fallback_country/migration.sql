ALTER TABLE "organization"
ADD COLUMN "operator_fallback_country_code" "CountryCode";

UPDATE "organization"
SET "operator_fallback_country_code" = 'SL'
WHERE "is_operator_fallback" = true;

CREATE UNIQUE INDEX "organization_operator_fallback_country_code_key"
ON "organization"("operator_fallback_country_code");

ALTER TABLE "organization"
ADD CONSTRAINT "organization_operator_fallback_country_code_fkey"
FOREIGN KEY ("operator_fallback_country_code") REFERENCES "country"("iso_code")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "organization"
DROP COLUMN "is_operator_fallback";
