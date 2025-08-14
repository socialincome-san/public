/*
  Warnings:

  - You are about to drop the column `duration` on the `program` table. All the data in the column will be lost.
  - You are about to drop the `payout_forecast` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PayoutInterval" AS ENUM ('monthly');

-- AlterTable
ALTER TABLE "program" DROP COLUMN "duration",
ADD COLUMN     "payout_amount" DOUBLE PRECISION NOT NULL DEFAULT 700,
ADD COLUMN     "payout_currency" TEXT NOT NULL DEFAULT 'SLE',
ADD COLUMN     "payout_interval" "PayoutInterval" NOT NULL DEFAULT 'monthly',
ADD COLUMN     "total_payments" INTEGER NOT NULL DEFAULT 36;

-- DropTable
DROP TABLE "payout_forecast";
