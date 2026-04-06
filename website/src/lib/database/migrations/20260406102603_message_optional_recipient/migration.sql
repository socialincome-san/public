-- DropIndex
DROP INDEX "message_recipient_type_recipient_id_idx";

-- AlterTable
ALTER TABLE "message" ALTER COLUMN "recipient_type" DROP NOT NULL,
ALTER COLUMN "recipient_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "message_recipient_id_idx" ON "message"("recipient_id");
