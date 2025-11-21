/*
  Warnings:

  - You are about to drop the column `monthly_interval` on the `contribution` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DonationInterval" AS ENUM ('monthly', 'quarterly', 'yearly');

-- AlterTable
ALTER TABLE "contribution" DROP COLUMN "monthly_interval",
ADD COLUMN     "interval" "DonationInterval";
