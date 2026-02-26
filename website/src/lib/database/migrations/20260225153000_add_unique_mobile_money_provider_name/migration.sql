-- Add uniqueness on mobile money provider names
CREATE UNIQUE INDEX "mobile_money_provider_name_key" ON "mobile_money_provider"("name");
