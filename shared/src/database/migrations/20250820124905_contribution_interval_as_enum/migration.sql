/*
  Warnings:

  - You are about to drop the column `monthly_interval` on the `contribution` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ContributionInterval" AS ENUM ('one_time', 'monthly', 'quarterly', 'annually');

-- AlterTable
ALTER TABLE "contribution" DROP COLUMN "monthly_interval",
ADD COLUMN     "contribution_interval" "ContributionInterval" NOT NULL DEFAULT 'one_time';
