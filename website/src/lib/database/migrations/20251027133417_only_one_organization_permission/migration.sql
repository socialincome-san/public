/*
  Warnings:

  - You are about to drop the column `permissions` on the `organization_access` table. All the data in the column will be lost.
  - You are about to drop the column `permissions` on the `program_access` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "organization_access" DROP COLUMN "permissions",
ADD COLUMN     "permission" "OrganizationPermission" NOT NULL DEFAULT 'readonly';

-- AlterTable
ALTER TABLE "program_access" DROP COLUMN "permissions",
ADD COLUMN     "permission" "ProgramPermission" NOT NULL DEFAULT 'readonly';
