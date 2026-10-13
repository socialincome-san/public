-- CreateTable
CREATE TABLE "entity_version" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_type" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_name" TEXT,
    "source" TEXT NOT NULL,
    "snapshot" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "entity_version_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "entity_version_entity_type_entity_id_created_at_idx" ON "entity_version"("entity_type", "entity_id", "created_at");


-- Versions are append-only. Retention or erasure needs a reviewed migration
-- that drops or disables these triggers.
CREATE FUNCTION "entity_version_prevent_mutation"() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'entity_version is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "entity_version_append_only"
    BEFORE UPDATE OR DELETE ON "entity_version"
    FOR EACH ROW EXECUTE FUNCTION "entity_version_prevent_mutation"();

CREATE TRIGGER "entity_version_no_truncate"
    BEFORE TRUNCATE ON "entity_version"
    FOR EACH STATEMENT EXECUTE FUNCTION "entity_version_prevent_mutation"();
