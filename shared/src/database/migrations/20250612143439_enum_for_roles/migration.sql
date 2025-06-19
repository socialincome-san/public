/*
  Warnings:

  - The `role` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `communitySize` to the `local_partner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `local_partner` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('contributor', 'localPartner', 'recipient', 'admin', 'superadmin', 'user');

-- AlterTable
ALTER TABLE "local_partner" ADD COLUMN     "communitySize" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'user';
