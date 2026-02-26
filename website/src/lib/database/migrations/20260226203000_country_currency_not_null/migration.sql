UPDATE "country" c
SET "currency" = p."payout_currency"
FROM (
  SELECT "country_id", MIN("payout_currency") AS "payout_currency"
  FROM "program"
  GROUP BY "country_id"
) p
WHERE c."id" = p."country_id"
  AND c."currency" IS NULL;

UPDATE "country"
SET "currency" = 'USD'
WHERE "currency" IS NULL;

ALTER TABLE "country"
ALTER COLUMN "currency" SET NOT NULL;
