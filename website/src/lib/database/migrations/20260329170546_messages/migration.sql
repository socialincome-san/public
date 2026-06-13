-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('sms', 'whatsapp', 'email');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('pending', 'sent', 'delivered', 'failed');

-- CreateEnum
CREATE TYPE "MessageRecipientType" AS ENUM ('recipient', 'contributor', 'local_partner', 'user');

-- CreateTable
CREATE TABLE "message_template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "message_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "recipient_type" "MessageRecipientType" NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "addressee" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'pending',
    "external_id" TEXT,
    "error_message" TEXT,
    "sent_at" TIMESTAMPTZ(3),
    "sent_by_user_id" TEXT NOT NULL,
    "template_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "message_template_name_key" ON "message_template"("name");

-- CreateIndex
CREATE INDEX "message_recipient_type_recipient_id_idx" ON "message"("recipient_type", "recipient_id");

-- CreateIndex
CREATE INDEX "message_status_idx" ON "message"("status");

-- CreateIndex
CREATE INDEX "message_sent_by_user_id_idx" ON "message"("sent_by_user_id");

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "message_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;
