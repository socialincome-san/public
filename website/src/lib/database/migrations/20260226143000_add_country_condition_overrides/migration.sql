-- Add manual override flags for country feasibility preconditions.
ALTER TABLE "country"
ADD COLUMN "cash_condition_override" BOOLEAN,
ADD COLUMN "mobile_money_condition_override" BOOLEAN;
