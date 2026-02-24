-- 1️⃣ Create mobile_money_provider table
CREATE TABLE "mobile_money_provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_supported" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    CONSTRAINT "mobile_money_provider_pkey" PRIMARY KEY ("id")
);

-- 2️⃣ Seed Orange Money
INSERT INTO "mobile_money_provider" ("id", "name", "is_supported")
VALUES ('orange-money', 'Orange Money', true)
ON CONFLICT ("id") DO NOTHING;

-- 3️⃣ Add new FK column to payment_information (keep old column for now)
ALTER TABLE "payment_information"
ADD COLUMN "mobile_money_provider_id" TEXT;

-- 4️⃣ Migrate existing provider values
UPDATE "payment_information"
SET "mobile_money_provider_id" = 'orange-money'
WHERE "provider" IS NOT NULL;

-- 5️⃣ Add FK constraint
ALTER TABLE "payment_information"
ADD CONSTRAINT "payment_information_mobile_money_provider_id_fkey"
FOREIGN KEY ("mobile_money_provider_id")
REFERENCES "mobile_money_provider"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 6️⃣ Drop old provider column
ALTER TABLE "payment_information"
DROP COLUMN "provider";

-- 7️⃣ Create join table for Country ↔ MobileMoneyProvider
CREATE TABLE "_CountryToMobileMoneyProvider" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CountryToMobileMoneyProvider_AB_pkey"
    PRIMARY KEY ("A","B")
);

CREATE INDEX "_CountryToMobileMoneyProvider_B_index"
ON "_CountryToMobileMoneyProvider"("B");

ALTER TABLE "_CountryToMobileMoneyProvider"
ADD CONSTRAINT "_CountryToMobileMoneyProvider_A_fkey"
FOREIGN KEY ("A")
REFERENCES "country"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "_CountryToMobileMoneyProvider"
ADD CONSTRAINT "_CountryToMobileMoneyProvider_B_fkey"
FOREIGN KEY ("B")
REFERENCES "mobile_money_provider"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 8️⃣ Drop old country.payment_providers column
ALTER TABLE "country"
DROP COLUMN "payment_providers";

-- 9️⃣ Finally drop enum
DROP TYPE "PaymentProvider";