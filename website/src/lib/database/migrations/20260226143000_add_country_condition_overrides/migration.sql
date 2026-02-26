-- Consolidated feature-branch migration:
-- - country condition overrides (required, default false)
-- - restrict mobile money provider deletes
-- - currency enum introduction for DB currency columns
-- - country currency + default payout amount

ALTER TABLE "country"
ADD COLUMN "cash_condition_override" BOOLEAN DEFAULT false,
ADD COLUMN "mobile_money_condition_override" BOOLEAN DEFAULT false;

UPDATE "country"
SET
  "cash_condition_override" = COALESCE("cash_condition_override", false),
  "mobile_money_condition_override" = COALESCE("mobile_money_condition_override", false);

ALTER TABLE "country"
ALTER COLUMN "cash_condition_override" SET NOT NULL,
ALTER COLUMN "mobile_money_condition_override" SET NOT NULL;

ALTER TABLE "payment_information"
DROP CONSTRAINT "payment_information_mobile_money_provider_id_fkey";

ALTER TABLE "payment_information"
ADD CONSTRAINT "payment_information_mobile_money_provider_id_fkey"
FOREIGN KEY ("mobile_money_provider_id")
REFERENCES "mobile_money_provider"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

CREATE TYPE "Currency" AS ENUM (
  'AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND',
  'BOB','BRL','BSD','BTC','BTN','BWP','BYN','BYR','BZD','CAD','CDF','CHF','CLF','CLP','CNY','COP','CRC','CUC',
  'CUP','CVE','CZK','DJF','DKK','DOP','DZD','EGP','ERN','ETB','EUR','FJD','FKP','FOK','GBP','GEL','GGP','GHS',
  'GIP','GMD','GNF','GTQ','GYD','HKD','HNL','HRK','HTG','HUF','IDR','ILS','IMP','INR','IQD','IRR','ISK','JEP',
  'JMD','JOD','JPY','KES','KGS','KHR','KID','KMF','KPW','KRW','KWD','KYD','KZT','LAK','LBP','LKR','LRD','LSL',
  'LTL','LYD','LVL','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRO','MUR','MVR','MWK','MXN','MYR','MZN','NAD',
  'NGN','NIO','NOK','NPR','NZD','OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF',
  'SAR','SBD','SCR','SDG','SEK','SGD','SHP','SLE','SLL','SOS','SRD','SSP','STD','SVC','SYP','SZL','THB','TJS',
  'TMT','TND','TOP','TRY','TTD','TWD','TZS','UAH','UGX','USD','UYU','UZS','VEF','VES','VND','VUV','WST','XAF',
  'XAU','XAG','XCD','XDR','XOF','XPF','YER','ZAR','ZMK','ZMW','ZWL'
);

ALTER TABLE "contribution"
ALTER COLUMN "currency" TYPE "Currency"
USING ("currency"::"Currency");

ALTER TABLE "payout"
ALTER COLUMN "currency" TYPE "Currency"
USING ("currency"::"Currency");

ALTER TABLE "program"
ALTER COLUMN "payout_currency" TYPE "Currency"
USING ("payout_currency"::"Currency");

ALTER TABLE "campaign"
ALTER COLUMN "currency" TYPE "Currency"
USING ("currency"::"Currency");

ALTER TABLE "exchange_rate"
ALTER COLUMN "currency" TYPE "Currency"
USING ("currency"::"Currency");

ALTER TABLE "country"
ADD COLUMN "currency" "Currency",
ADD COLUMN "default_payout_amount" DECIMAL(12,4);

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
