BEGIN;

UPDATE "subscription" SET "status" = 'ended' WHERE "status" = 'canceled';

CREATE TYPE "SubscriptionStatus_new" AS ENUM ('active', 'ended');

ALTER TABLE "subscription" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "subscription"
ALTER COLUMN "status" TYPE "SubscriptionStatus_new"
USING ("status"::text::"SubscriptionStatus_new");

ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";

DROP TYPE "public"."SubscriptionStatus_old";

ALTER TABLE "subscription" ALTER COLUMN "status" SET DEFAULT 'active';

COMMIT;
