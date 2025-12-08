/*
  Warnings:

  - You are about to drop the column `institution` on the `contributor` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `payout` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `phone` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `phone` table. All the data in the column will be lost.
  - You are about to drop the column `whats_app` on the `phone` table. All the data in the column will be lost.
  - You are about to drop the column `comments` on the `survey` table. All the data in the column will be lost.
  - You are about to drop the column `sent_at` on the `survey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contact" ADD COLUMN     "is_institution" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "contributor" DROP COLUMN "institution";

-- AlterTable
ALTER TABLE "payout" DROP COLUMN "message";

-- AlterTable
ALTER TABLE "phone" DROP COLUMN "type",
DROP COLUMN "verified",
DROP COLUMN "whats_app",
ADD COLUMN     "has_whatsapp" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "survey" DROP COLUMN "comments",
DROP COLUMN "sent_at";

-- DropEnum
DROP TYPE "WhatsAppActivationStatus";
