-- Prevent deleting a provider while payment information still references it.
ALTER TABLE "payment_information"
DROP CONSTRAINT "payment_information_mobile_money_provider_id_fkey";

ALTER TABLE "payment_information"
ADD CONSTRAINT "payment_information_mobile_money_provider_id_fkey"
FOREIGN KEY ("mobile_money_provider_id")
REFERENCES "mobile_money_provider"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
