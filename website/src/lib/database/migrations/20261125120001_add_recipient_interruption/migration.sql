ALTER TABLE "recipient"
ADD COLUMN "interrupted_at" TIMESTAMPTZ(3),
ADD COLUMN "interruption_comment" TEXT;
