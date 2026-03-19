/*
  Warnings:

  - You are about to drop the column `organization_id` on the `campaign` table. All the data in the column will be lost.
  - You are about to drop the column `permission` on the `organization_access` table. All the data in the column will be lost.
  - Made the column `program_id` on table `campaign` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "campaign" DROP CONSTRAINT "campaign_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "campaign" DROP CONSTRAINT "campaign_program_id_fkey";

-- AlterTable
ALTER TABLE "campaign" DROP COLUMN "organization_id",
ALTER COLUMN "program_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "organization_access" DROP COLUMN "permission";

-- DropEnum
DROP TYPE "OrganizationPermission";

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
