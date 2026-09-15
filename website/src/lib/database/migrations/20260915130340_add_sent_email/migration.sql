-- DropForeignKey
ALTER TABLE "campaign" DROP CONSTRAINT "campaign_contributor_id_fkey";

-- CreateTable
CREATE TABLE "sent_email" (
    "id" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "from_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "sent_email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sent_email_sent_at_idx" ON "sent_email"("sent_at");

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "contributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
