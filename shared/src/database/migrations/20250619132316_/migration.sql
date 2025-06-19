/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `local_partner` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "local_partner_name_key" ON "local_partner"("name");
