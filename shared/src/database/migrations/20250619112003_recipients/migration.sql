/*
  Warnings:

  - Added the required column `status` to the `recipient` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RecipientStatus" AS ENUM ('active', 'suspended', 'waitlisted', 'designated', 'former');

-- AlterTable
ALTER TABLE "recipient" ADD COLUMN     "startDate" TIMESTAMPTZ(3),
ADD COLUMN     "status" "RecipientStatus" NOT NULL,
ADD COLUMN     "testRecipient" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "birthDate" DATE,
ADD COLUMN     "callingName" TEXT,
ADD COLUMN     "communicationPhone" TEXT,
ADD COLUMN     "hasWhatsAppComm" BOOLEAN,
ADD COLUMN     "hasWhatsAppMobile" BOOLEAN,
ADD COLUMN     "instaHandle" TEXT,
ADD COLUMN     "mobileMoneyPhone" TEXT,
ADD COLUMN     "omUid" INTEGER,
ADD COLUMN     "profession" TEXT,
ADD COLUMN     "twitterHandle" TEXT,
ADD COLUMN     "whatsappActivated" BOOLEAN;
