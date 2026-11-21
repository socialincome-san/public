CREATE TYPE "SentEmailStatus" AS ENUM ('queued', 'sent', 'failed', 'deferred', 'delivered', 'opened', 'bounced', 'dropped', 'spam_reported');

ALTER TABLE "sent_email"
ADD COLUMN "type" TEXT,
ADD COLUMN "status" "SentEmailStatus" NOT NULL DEFAULT 'sent',
ADD COLUMN "status_updated_at" TIMESTAMPTZ(3),
ADD COLUMN "error_message" TEXT,
ADD COLUMN "provider_message_id" TEXT,
ADD COLUMN "idempotency_key" TEXT,
ADD COLUMN "campaign_id" TEXT;

CREATE UNIQUE INDEX "sent_email_idempotency_key_key" ON "sent_email"("idempotency_key");

CREATE INDEX "sent_email_campaign_id_idx" ON "sent_email"("campaign_id");

ALTER TABLE "sent_email" ADD CONSTRAINT "sent_email_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
