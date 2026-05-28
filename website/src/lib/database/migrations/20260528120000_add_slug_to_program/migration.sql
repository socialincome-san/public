ALTER TABLE "program" ADD COLUMN "slug" TEXT;

WITH slugged AS (
  SELECT
    "id",
    regexp_replace(
      regexp_replace(lower(trim("name")), '[^a-z0-9]+', '-', 'g'),
      '(^-+|-+$)',
      '',
      'g'
    ) AS "base_slug",
    ROW_NUMBER() OVER (
      PARTITION BY regexp_replace(
        regexp_replace(lower(trim("name")), '[^a-z0-9]+', '-', 'g'),
        '(^-+|-+$)',
        '',
        'g'
      )
      ORDER BY "created_at", "id"
    ) AS "rn"
  FROM "program"
)
UPDATE "program" AS "p"
SET "slug" = CASE
  WHEN "s"."rn" = 1 THEN "s"."base_slug"
  ELSE "s"."base_slug" || '-' || "s"."rn"
END
FROM slugged AS "s"
WHERE "p"."id" = "s"."id";

UPDATE "program"
SET "slug" = "id"
WHERE "slug" IS NULL OR "slug" = '';

ALTER TABLE "program" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "program_slug_key" ON "program"("slug");
