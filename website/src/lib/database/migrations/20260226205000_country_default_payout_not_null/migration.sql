UPDATE "country" c
SET "default_payout_amount" = p."payout_per_interval"
FROM (
  SELECT "country_id", MIN("payout_per_interval") AS "payout_per_interval"
  FROM "program"
  GROUP BY "country_id"
) p
WHERE c."id" = p."country_id"
  AND c."default_payout_amount" IS NULL;

UPDATE "country"
SET "default_payout_amount" = 0
WHERE "default_payout_amount" IS NULL;

ALTER TABLE "country"
ALTER COLUMN "default_payout_amount" SET NOT NULL;
