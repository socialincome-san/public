-- DropForeignKey
ALTER TABLE "payment_information" DROP CONSTRAINT "payment_information_phone_id_fkey";

-- AlterTable
ALTER TABLE "payment_information" ALTER COLUMN "phone_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "payment_information" ADD CONSTRAINT "payment_information_phone_id_fkey" FOREIGN KEY ("phone_id") REFERENCES "phone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
