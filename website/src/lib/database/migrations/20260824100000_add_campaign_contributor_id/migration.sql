-- AlterTable
ALTER TABLE "campaign" ADD COLUMN "contributor_id" TEXT;

-- CreateIndex
CREATE INDEX "campaign_contributor_id_idx" ON "campaign"("contributor_id");

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
