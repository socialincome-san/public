/*
  Warnings:

  - Made the column `phone_id` on table `payment_information` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "payment_information" DROP CONSTRAINT "payment_information_phone_id_fkey";

-- AlterTable
ALTER TABLE "payment_information" ALTER COLUMN "phone_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "payment_information" ADD CONSTRAINT "payment_information_phone_id_fkey" FOREIGN KEY ("phone_id") REFERENCES "phone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
