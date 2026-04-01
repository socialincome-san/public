-- CreateTable
CREATE TABLE "focus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "focus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "focus_name_key" ON "focus"("name");

-- Seed default causes from existing enum values
INSERT INTO "focus" ("id", "name")
VALUES
    ('focus-poverty', 'poverty'),
    ('focus-health', 'health'),
    ('focus-gender-based-violence', 'gender_based_violence'),
    ('focus-climate', 'climate');

-- Create focus relations table for local partners
CREATE TABLE "local_partner_focus" (
    "local_partner_id" TEXT NOT NULL,
    "focus_id" TEXT NOT NULL,

    CONSTRAINT "local_partner_focus_pkey" PRIMARY KEY ("local_partner_id","focus_id")
);

CREATE INDEX "local_partner_focus_focus_id_idx" ON "local_partner_focus"("focus_id");

ALTER TABLE "local_partner_focus"
ADD CONSTRAINT "local_partner_focus_focus_id_fkey" FOREIGN KEY ("focus_id") REFERENCES "focus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "local_partner_focus"
ADD CONSTRAINT "local_partner_focus_local_partner_id_fkey" FOREIGN KEY ("local_partner_id") REFERENCES "local_partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill local partner causes
INSERT INTO "local_partner_focus" ("focus_id", "local_partner_id")
SELECT c.id, lp.id
FROM "local_partner" lp
CROSS JOIN LATERAL unnest(lp."causes") AS cause_name
JOIN "focus" c ON c."name" = cause_name::text;

-- Create focus relations table for programs
CREATE TABLE "program_target_focus" (
    "program_id" TEXT NOT NULL,
    "focus_id" TEXT NOT NULL,

    CONSTRAINT "program_target_focus_pkey" PRIMARY KEY ("program_id","focus_id")
);

CREATE INDEX "program_target_focus_focus_id_idx" ON "program_target_focus"("focus_id");

ALTER TABLE "program_target_focus"
ADD CONSTRAINT "program_target_focus_focus_id_fkey" FOREIGN KEY ("focus_id") REFERENCES "focus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "program_target_focus"
ADD CONSTRAINT "program_target_focus_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill program target causes
INSERT INTO "program_target_focus" ("focus_id", "program_id")
SELECT c.id, p.id
FROM "program" p
CROSS JOIN LATERAL unnest(p."target_causes") AS cause_name
JOIN "focus" c ON c."name" = cause_name::text;

-- Drop enum-array columns that were replaced by relations
ALTER TABLE "local_partner" DROP COLUMN "causes";
ALTER TABLE "program" DROP COLUMN "target_causes";

-- Drop enum type after all columns are removed
DROP TYPE "Cause";
