/*
  Warnings:

  - The values [readonly,edit] on the enum `ProgramPermission` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `owner_organization_id` on the `program` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `program_access` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organization_id,programId]` on the table `program_access` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organization_id` to the `program_access` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProgramPermission_new" AS ENUM ('owner', 'operator');
ALTER TABLE "public"."program_access" ALTER COLUMN "permission" DROP DEFAULT;
ALTER TABLE "program_access" ALTER COLUMN "permission" TYPE "ProgramPermission_new" USING ("permission"::text::"ProgramPermission_new");
ALTER TYPE "ProgramPermission" RENAME TO "ProgramPermission_old";
ALTER TYPE "ProgramPermission_new" RENAME TO "ProgramPermission";
DROP TYPE "public"."ProgramPermission_old";
ALTER TABLE "program_access" ALTER COLUMN "permission" SET DEFAULT 'owner';
COMMIT;

-- DropForeignKey
ALTER TABLE "program" DROP CONSTRAINT "program_owner_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "program_access" DROP CONSTRAINT "program_access_user_id_fkey";

-- DropIndex
DROP INDEX "program_access_user_id_programId_key";

-- AlterTable
ALTER TABLE "program" DROP COLUMN "owner_organization_id";

-- AlterTable
ALTER TABLE "program_access" DROP COLUMN "user_id",
ADD COLUMN     "organization_id" TEXT NOT NULL,
ALTER COLUMN "permission" SET DEFAULT 'owner';

-- CreateIndex
CREATE UNIQUE INDEX "program_access_organization_id_programId_key" ON "program_access"("organization_id", "programId");

-- AddForeignKey
ALTER TABLE "program_access" ADD CONSTRAINT "program_access_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
