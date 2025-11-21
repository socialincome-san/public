/*
  Warnings:

  - You are about to drop the column `operator_organization_id` on the `program` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "program" DROP CONSTRAINT "program_operator_organization_id_fkey";

-- AlterTable
ALTER TABLE "program" DROP COLUMN "operator_organization_id";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "active_organization_id" TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_active_organization_id_fkey" FOREIGN KEY ("active_organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
