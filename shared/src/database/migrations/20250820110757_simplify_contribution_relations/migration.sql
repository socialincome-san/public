/*
  Warnings:

  - You are about to drop the column `organization_id` on the `campaign` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `contribution` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "campaign" DROP CONSTRAINT "campaign_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "contribution" DROP CONSTRAINT "contribution_organization_id_fkey";

-- AlterTable
ALTER TABLE "campaign" DROP COLUMN "organization_id";

-- AlterTable
ALTER TABLE "contribution" DROP COLUMN "organization_id",
ADD COLUMN     "program_id" TEXT;

-- AddForeignKey
ALTER TABLE "contribution" ADD CONSTRAINT "contribution_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
