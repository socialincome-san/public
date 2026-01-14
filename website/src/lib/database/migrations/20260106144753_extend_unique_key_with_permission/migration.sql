/*
  Warnings:

  - A unique constraint covering the columns `[organization_id,programId,permission]` on the table `program_access` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "program_access_organization_id_programId_key";

-- CreateIndex
CREATE UNIQUE INDEX "program_access_organization_id_programId_permission_key" ON "program_access"("organization_id", "programId", "permission");
