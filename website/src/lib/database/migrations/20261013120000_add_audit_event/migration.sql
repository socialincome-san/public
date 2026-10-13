-- CreateTable
CREATE TABLE "audit_event" (
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

    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_event_entity_type_entity_id_created_at_idx" ON "audit_event"("entity_type", "entity_id", "created_at");


-- Audit events are append-only. Retention or erasure needs a reviewed migration
-- that drops or disables these triggers.
CREATE FUNCTION "audit_event_prevent_mutation"() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'audit_event is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "audit_event_append_only"
    BEFORE UPDATE OR DELETE ON "audit_event"
    FOR EACH ROW EXECUTE FUNCTION "audit_event_prevent_mutation"();

CREATE TRIGGER "audit_event_no_truncate"
    BEFORE TRUNCATE ON "audit_event"
    FOR EACH STATEMENT EXECUTE FUNCTION "audit_event_prevent_mutation"();
