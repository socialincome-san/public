-- AlterTable
ALTER TABLE "survey" ADD COLUMN     "program_id" TEXT;

-- AddForeignKey
ALTER TABLE "survey" ADD CONSTRAINT "survey_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
