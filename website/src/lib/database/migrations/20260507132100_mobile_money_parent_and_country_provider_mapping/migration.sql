-- 1) Add optional parent mobile money provider
ALTER TABLE "mobile_money_provider"
ADD COLUMN "parent_id" TEXT;

ALTER TABLE "mobile_money_provider"
ADD CONSTRAINT "mobile_money_provider_parent_id_fkey"
FOREIGN KEY ("parent_id") REFERENCES "mobile_money_provider"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 2) Create explicit mapping table for Country ↔ MobileMoneyProvider
CREATE TABLE "country_mobile_money_provider_mapping" (
    "id" TEXT NOT NULL,
    "country_id" TEXT NOT NULL,
    "mobile_money_provider_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    CONSTRAINT "country_mobile_money_provider_mapping_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "country_mobile_money_provider_mapping"
ADD CONSTRAINT "country_mobile_money_provider_mapping_country_id_fkey"
FOREIGN KEY ("country_id") REFERENCES "country"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "country_mobile_money_provider_mapping"
ADD CONSTRAINT "country_mobile_money_provider_mapping_mobile_money_provider_id_fkey"
FOREIGN KEY ("mobile_money_provider_id") REFERENCES "mobile_money_provider"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "country_mobile_money_provider_mapping"
ADD CONSTRAINT "country_mobile_money_provider_mapping_country_id_mobile_money_provider_id_key"
UNIQUE ("country_id", "mobile_money_provider_id");

-- 3) Migrate existing implicit relations if present
-- The implicit join table was introduced by a prior migration and may exist in some DBs.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = '_CountryToMobileMoneyProvider'
  ) THEN
    INSERT INTO "country_mobile_money_provider_mapping" ("id", "country_id", "mobile_money_provider_id")
    SELECT
      'country-mobile-money-provider-mapping-' || "A" || '-' || "B" AS "id",
      "A" AS "country_id",
      "B" AS "mobile_money_provider_id"
    FROM "_CountryToMobileMoneyProvider"
    ON CONFLICT ("country_id","mobile_money_provider_id") DO NOTHING;

    DROP TABLE "_CountryToMobileMoneyProvider";
  END IF;
END $$;

