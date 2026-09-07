-- CreateEnum
CREATE TYPE "SubscriptionCancellationReason" AS ENUM (
  'financial_situation_changed',
  'different_cause',
  'not_enough_updates',
  'technical_issue',
  'prefer_one_time',
  'pausing',
  'other'
);

-- AlterTable
ALTER TABLE "subscription" ADD COLUMN "cancellation_reason" "SubscriptionCancellationReason";
