-- Normalize existing subscription intervals before restricting the enum.
UPDATE "subscription" SET "interval" = 'monthly' WHERE "interval" <> 'monthly';

-- Replace DonationInterval with monthly-only variant.
CREATE TYPE "DonationInterval_new" AS ENUM ('monthly');

ALTER TABLE "subscription"
ALTER COLUMN "interval" TYPE "DonationInterval_new"
USING ("interval"::text::"DonationInterval_new");

DROP TYPE "DonationInterval";

ALTER TYPE "DonationInterval_new" RENAME TO "DonationInterval";
