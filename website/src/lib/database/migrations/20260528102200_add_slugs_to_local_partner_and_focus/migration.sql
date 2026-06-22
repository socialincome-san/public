-- Add slug fields (backfilled from names)
ALTER TABLE "local_partner" ADD COLUMN "slug" TEXT;
ALTER TABLE "focus" ADD COLUMN "slug" TEXT;

-- Backfill local partners
WITH base AS (
    SELECT
        "id",
        lower(
            regexp_replace(
                regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g'),
                '(^-|-$)',
                '',
                'g'
            )
        ) AS "slug_base"
    FROM "local_partner"
),
dedup AS (
    SELECT
        "id",
        CASE
            WHEN count(*) OVER (PARTITION BY "slug_base") = 1 THEN "slug_base"
            ELSE "slug_base" || '-' || row_number() OVER (PARTITION BY "slug_base" ORDER BY "id")::text
        END AS "slug"
    FROM base
)
UPDATE "local_partner" lp
SET "slug" = d."slug"
FROM dedup d
WHERE lp."id" = d."id";

-- Backfill focuses
WITH base AS (
    SELECT
        "id",
        lower(
            regexp_replace(
                regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g'),
                '(^-|-$)',
                '',
                'g'
            )
        ) AS "slug_base"
    FROM "focus"
),
dedup AS (
    SELECT
        "id",
        CASE
            WHEN count(*) OVER (PARTITION BY "slug_base") = 1 THEN "slug_base"
            ELSE "slug_base" || '-' || row_number() OVER (PARTITION BY "slug_base" ORDER BY "id")::text
        END AS "slug"
    FROM base
)
UPDATE "focus" f
SET "slug" = d."slug"
FROM dedup d
WHERE f."id" = d."id";

-- Enforce required + unique (matching Prisma @unique)
ALTER TABLE "local_partner" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "focus" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "local_partner_slug_key" ON "local_partner"("slug");
CREATE UNIQUE INDEX "focus_slug_key" ON "focus"("slug");

