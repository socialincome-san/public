-- CreateEnum
CREATE TYPE "PayoutInterval" AS ENUM ('monthly', 'quarterly', 'yearly');

-- Drop old column
ALTER TABLE "program"
DROP COLUMN "payout_interval";

-- Add new enum column with default
ALTER TABLE "program"
ADD COLUMN "payout_interval" "PayoutInterval" NOT NULL DEFAULT 'monthly';