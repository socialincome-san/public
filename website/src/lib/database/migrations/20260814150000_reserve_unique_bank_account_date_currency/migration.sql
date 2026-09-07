-- DropIndex
DROP INDEX "reserve_bank_account_id_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "reserve_bank_account_id_date_currency_key" ON "reserve"("bank_account_id", "date", "currency");
