-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'canceled', 'ended');

-- CreateEnum
CREATE TYPE "SubscriptionPaymentMethod" AS ENUM ('stripe', 'bank_transfer');

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "contributor_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "amount" DECIMAL(12,4) NOT NULL,
    "currency" "Currency" NOT NULL,
    "interval" "DonationInterval" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "payment_method" "SubscriptionPaymentMethod" NOT NULL,
    "stripe_subscription_id" TEXT,
    "bank_standing_order_reference" TEXT,
    "canceled_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "contribution" DROP COLUMN "interval",
ADD COLUMN     "subscription_id" TEXT;

-- CreateIndex
CREATE INDEX "subscription_contributor_id_idx" ON "subscription"("contributor_id");

-- CreateIndex
CREATE INDEX "subscription_status_idx" ON "subscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_stripe_subscription_id_key" ON "subscription"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_bank_standing_order_reference_key" ON "subscription"("bank_standing_order_reference");

-- CreateIndex
CREATE INDEX "contribution_subscription_id_idx" ON "contribution"("subscription_id");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution" ADD CONSTRAINT "contribution_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
