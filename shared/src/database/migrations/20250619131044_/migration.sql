/*
  Warnings:

  - You are about to drop the column `title` on the `program` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `program` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `program` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "program" DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "program_name_key" ON "program"("name");
