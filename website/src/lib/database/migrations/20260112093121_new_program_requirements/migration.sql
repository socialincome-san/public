ALTER TABLE "program"
RENAME COLUMN "payout_amount" TO "payout_per_interval";

ALTER TABLE "program"
RENAME COLUMN "total_payments" TO "program_duration_in_months";

ALTER TABLE "program"
ADD COLUMN "amount_of_recipients_for_start" INTEGER;
