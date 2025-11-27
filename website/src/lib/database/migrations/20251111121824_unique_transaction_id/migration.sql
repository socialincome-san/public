-- First, update all NULL and empty transaction_id values with a unique identifier
-- Using 'legacy_' prefix + payment_event.id to ensure uniqueness
UPDATE "payment_event" 
SET "transaction_id" = 'legacy_' || "id"::text 
WHERE "transaction_id" IS NULL OR "transaction_id" = '';

-- Handle duplicate transaction_id values by making them unique
-- Keep the first occurrence, append _prod_dup_{id} to duplicates
WITH duplicates AS (
  SELECT 
    "id",
    "transaction_id",
    ROW_NUMBER() OVER (PARTITION BY "transaction_id" ORDER BY "created_at", "id") as rn
  FROM "payment_event"
  WHERE "transaction_id" IS NOT NULL AND "transaction_id" != ''
)
UPDATE "payment_event" 
SET "transaction_id" = "payment_event"."transaction_id" || '_prod_dup_' || "payment_event"."id"::text
FROM duplicates
WHERE duplicates."id" = "payment_event"."id" 
  AND duplicates.rn > 1;

-- Now make the column required (no more NULL values)
ALTER TABLE "payment_event" ALTER COLUMN "transaction_id" SET NOT NULL;

-- Create the unique index (now all values are unique)
CREATE UNIQUE INDEX "payment_event_transaction_id_key" ON "payment_event"("transaction_id");
