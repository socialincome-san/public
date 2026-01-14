-- DropForeignKey
ALTER TABLE "recipient" DROP CONSTRAINT "recipient_program_id_fkey";

-- AlterTable
ALTER TABLE "recipient" ALTER COLUMN "program_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "recipient" ADD CONSTRAINT "recipient_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
