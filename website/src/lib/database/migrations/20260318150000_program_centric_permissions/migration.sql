/*
  Warnings:

  - The column `permission` on `organization_access` will be dropped.
  - The enum `OrganizationPermission` will be dropped.
  - `campaign.program_id` will become required.
*/

-- Backfill campaign.program_id for legacy organization-scoped campaigns.
-- Prefer owner access, then operator access; use deterministic tiebreaker by program id.
UPDATE "campaign" AS c
SET "program_id" = pa."programId"
FROM LATERAL (
	SELECT p."programId"
	FROM "program_access" AS p
	WHERE p."organization_id" = c."organization_id"
	ORDER BY
		CASE WHEN p."permission" = 'owner' THEN 0 ELSE 1 END,
		p."programId" ASC
	LIMIT 1
) AS pa
WHERE c."program_id" IS NULL;

DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM "campaign" WHERE "program_id" IS NULL) THEN
		RAISE EXCEPTION 'Cannot enforce NOT NULL on campaign.program_id; unresolved campaigns remain.';
	END IF;
END $$;

-- Remove organization-level permission field.
ALTER TABLE "organization_access" DROP COLUMN "permission";

-- Enforce strict program-scoped campaigns.
ALTER TABLE "campaign" ALTER COLUMN "program_id" SET NOT NULL;

-- Remove direct campaign-to-organization relation.
ALTER TABLE "campaign" DROP CONSTRAINT "campaign_organization_id_fkey";
ALTER TABLE "campaign" DROP COLUMN "organization_id";

-- Remove obsolete enum.
DROP TYPE "OrganizationPermission";
