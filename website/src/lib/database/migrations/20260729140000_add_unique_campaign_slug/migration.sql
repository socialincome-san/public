-- Normalize blank slugs to NULL (Postgres UNIQUE allows multiple NULLs, not multiple '')
UPDATE "campaign"
SET "slug" = NULL
WHERE "slug" IS NOT NULL AND btrim("slug") = '';

-- Dedupe non-null slugs before unique index: keep first occurrence, suffix the rest with id
WITH ranked AS (
  SELECT
    "id",
    "slug",
    ROW_NUMBER() OVER (
      PARTITION BY "slug"
      ORDER BY "created_at" ASC NULLS LAST, "id" ASC
    ) AS "rn"
  FROM "campaign"
  WHERE "slug" IS NOT NULL
)
UPDATE "campaign" AS "c"
SET "slug" = "c"."slug" || '-' || "c"."id"
FROM ranked AS "r"
WHERE "c"."id" = "r"."id"
  AND "r"."rn" > 1;

-- CreateIndex
CREATE UNIQUE INDEX "campaign_slug_key" ON "campaign"("slug");
