-- AlterTable - Add columns (name as nullable first)
ALTER TABLE "survey" ADD COLUMN     "name" TEXT,
ADD COLUMN     "survey_schedule_id" TEXT;

-- Update existing surveys with unique names based on questionnaire and ID
UPDATE "survey" 
SET "name" = questionnaire || '-' || "id" 
WHERE "name" IS NULL;

-- Make the name column NOT NULL after setting values
ALTER TABLE "survey" ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "survey_schedule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "questionnaire" "SurveyQuestionnaire" NOT NULL,
    "due_in_months_after_start" INTEGER NOT NULL,
    "program_id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "survey_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "survey_schedule_name_questionnaire_due_in_months_after_star_key" ON "survey_schedule"("name", "questionnaire", "due_in_months_after_start", "program_id");

-- CreateIndex
CREATE UNIQUE INDEX "survey_recipient_id_name_key" ON "survey"("recipient_id", "name");

-- AddForeignKey
ALTER TABLE "survey" ADD CONSTRAINT "survey_survey_schedule_id_fkey" FOREIGN KEY ("survey_schedule_id") REFERENCES "survey_schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_schedule" ADD CONSTRAINT "survey_schedule_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
