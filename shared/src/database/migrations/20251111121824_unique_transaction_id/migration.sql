-- First, update all NULL and empty transaction_id values with a unique identifier
-- Using 'legacy_' prefix + payment_event.id to ensure uniqueness
UPDATE "payment_event" 
SET "transaction_id" = 'legacy_' || "id"::text 
WHERE "transaction_id" IS NULL OR "transaction_id" = '';

-- Now make the column required (no more NULL values)
ALTER TABLE "payment_event" ALTER COLUMN "transaction_id" SET NOT NULL;

-- Create the unique index
CREATE UNIQUE INDEX "payment_event_transaction_id_key" ON "payment_event"("transaction_id");
