/*
  Warnings:

  - Added the required column `payment_at` to the `payout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `payout` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('created', 'paid', 'confirmed', 'contested', 'failed', 'other');

-- AlterTable
ALTER TABLE "payout" ADD COLUMN     "amount_chf" DOUBLE PRECISION,
ADD COLUMN     "comments" TEXT,
ADD COLUMN     "message" JSONB,
ADD COLUMN     "payment_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "status" "PayoutStatus" NOT NULL;
