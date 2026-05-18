-- CreateEnum
CREATE TYPE "PayoutProcess" AS ENUM ('orange_money_csv');

-- AlterTable
ALTER TABLE "mobile_money_provider" ADD COLUMN "payout_process" "PayoutProcess";

-- Backfill payout process from former is_supported flag, then drop the column
UPDATE "mobile_money_provider"
SET "payout_process" = 'orange_money_csv'
WHERE "is_supported" = true;

ALTER TABLE "mobile_money_provider" DROP COLUMN "is_supported";
