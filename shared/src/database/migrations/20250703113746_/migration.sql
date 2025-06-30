-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('account_fees', 'administrative', 'delivery_fees', 'donation_fees', 'exchange_rate_loss', 'fundraising_advertising', 'staff');

-- CreateTable
CREATE TABLE "expense" (
    "id" TEXT NOT NULL,
    "type" "ExpenseType" NOT NULL,
    "year" INTEGER NOT NULL,
    "amount_chf" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);
