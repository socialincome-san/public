-- CreateTable
CREATE TABLE "campaign_pending" (
    "claim_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,

    CONSTRAINT "campaign_pending_pkey" PRIMARY KEY ("claim_id")
);

-- AddForeignKey
ALTER TABLE "campaign_pending" ADD CONSTRAINT "campaign_pending_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
