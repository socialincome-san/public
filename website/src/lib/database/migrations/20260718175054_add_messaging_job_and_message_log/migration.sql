-- CreateEnum
CREATE TYPE "MessagingChannel" AS ENUM ('sms', 'whatsapp');

-- CreateEnum
CREATE TYPE "MessagingJobStatus" AS ENUM ('running', 'completed', 'interrupted', 'failed');

-- CreateTable
CREATE TABLE "messaging_job" (
    "id" TEXT NOT NULL,
    "template_sid" TEXT NOT NULL,
    "template_friendly_name" TEXT NOT NULL,
    "channel_requested" "MessagingChannel" NOT NULL,
    "recipient_type" TEXT NOT NULL,
    "assignments" JSONB NOT NULL,
    "total_selected" INTEGER NOT NULL,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "skipped_count" INTEGER NOT NULL DEFAULT 0,
    "fallback_count" INTEGER NOT NULL DEFAULT 0,
    "delivered_count" INTEGER NOT NULL DEFAULT 0,
    "status" "MessagingJobStatus" NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "started_at" TIMESTAMPTZ(3) NOT NULL,
    "finished_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "messaging_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_log" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "phone_number" TEXT,
    "channel_requested" "MessagingChannel" NOT NULL,
    "channel_used" "MessagingChannel",
    "fell_back" BOOLEAN NOT NULL DEFAULT false,
    "rendered_body" TEXT NOT NULL,
    "twilio_message_sid" TEXT,
    "twilio_status" TEXT,
    "twilio_error_code" TEXT,
    "twilio_error_message" TEXT,
    "skipped_reason" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "message_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "messaging_job_created_by_id_idx" ON "messaging_job"("created_by_id");

-- CreateIndex
CREATE INDEX "messaging_job_status_idx" ON "messaging_job"("status");

-- CreateIndex
CREATE UNIQUE INDEX "message_log_twilio_message_sid_key" ON "message_log"("twilio_message_sid");

-- CreateIndex
CREATE INDEX "message_log_job_id_idx" ON "message_log"("job_id");

-- CreateIndex
CREATE INDEX "message_log_contact_id_idx" ON "message_log"("contact_id");

-- RenameForeignKey
ALTER TABLE "country_mobile_money_provider_mapping" RENAME CONSTRAINT "country_mobile_money_provider_mapping_mobile_money_provider_id_" TO "country_mobile_money_provider_mapping_mobile_money_provide_fkey";

-- AddForeignKey
ALTER TABLE "messaging_job" ADD CONSTRAINT "messaging_job_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_log" ADD CONSTRAINT "message_log_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "messaging_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_log" ADD CONSTRAINT "message_log_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "country_mobile_money_provider_mapping_country_id_mobile_money_p" RENAME TO "country_mobile_money_provider_mapping_country_id_mobile_mon_key";
