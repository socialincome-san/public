ALTER TABLE "local_partner"
ADD COLUMN "account_id" TEXT;

INSERT INTO "account" (id, firebase_auth_user_id, created_at)
SELECT gen_random_uuid(), 'localpartner_' || lp.id, NOW()
FROM "local_partner" lp
WHERE lp.account_id IS NULL;

UPDATE "local_partner" lp
SET account_id = a.id
FROM "account" a
WHERE lp.account_id IS NULL
  AND a.firebase_auth_user_id = 'localpartner_' || lp.id;

ALTER TABLE "local_partner"
ALTER COLUMN "account_id" SET NOT NULL;

CREATE UNIQUE INDEX "local_partner_account_id_key"
ON "local_partner"("account_id");

ALTER TABLE "local_partner"
ADD CONSTRAINT "local_partner_account_id_fkey"
FOREIGN KEY ("account_id")
REFERENCES "account"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;