CREATE TYPE "ContributionSourceType" AS ENUM ('individual', 'foundation_grant', 'corporate_partner');

ALTER TABLE "contribution"
ADD COLUMN "source_type" "ContributionSourceType" NOT NULL DEFAULT 'individual';
