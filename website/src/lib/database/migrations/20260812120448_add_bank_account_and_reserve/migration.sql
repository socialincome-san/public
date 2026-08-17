-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('postfinance', 'pawapay_wallet', 'custodian_stablecoin_wallet', 'local_bank', 'mobile_money_wallet');

-- CreateTable
CREATE TABLE "bank_account" (
    "id" TEXT NOT NULL,
    "type" "BankAccountType" NOT NULL,
    "bank_account_number" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "bank_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserve" (
    "id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "amount" DECIMAL(12,4) NOT NULL,
    "currency" "Currency" NOT NULL,
    "amount_chf" DECIMAL(12,4) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "reserve_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reserve_bank_account_id_idx" ON "reserve"("bank_account_id");

-- AddForeignKey
ALTER TABLE "reserve" ADD CONSTRAINT "reserve_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
