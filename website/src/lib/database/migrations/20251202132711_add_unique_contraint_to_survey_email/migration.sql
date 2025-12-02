/*
  Warnings:

  - A unique constraint covering the columns `[access_email]` on the table `survey` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "survey_access_email_key" ON "survey"("access_email");
