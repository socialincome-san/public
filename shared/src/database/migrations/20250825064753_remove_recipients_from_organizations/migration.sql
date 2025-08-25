/*
  Warnings:

  - You are about to drop the column `organization_id` on the `recipient` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "recipient" DROP CONSTRAINT "recipient_organization_id_fkey";

-- AlterTable
ALTER TABLE "recipient" DROP COLUMN "organization_id";
