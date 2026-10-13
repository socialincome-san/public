-- CreateTable
CREATE TABLE "audit_event" (
    "id" TEXT NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_type" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_event_entity_type_entity_id_occurred_at_idx" ON "audit_event"("entity_type", "entity_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "audit_event_actor_type_actor_id_occurred_at_idx" ON "audit_event"("actor_type", "actor_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "audit_event_occurred_at_idx" ON "audit_event"("occurred_at" DESC);


-- Audit events are append-only. Retention or erasure needs a reviewed
-- migration that drops or disables this trigger.
CREATE FUNCTION "audit_event_prevent_mutation"() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'audit_event is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "audit_event_append_only"
    BEFORE UPDATE OR DELETE ON "audit_event"
    FOR EACH ROW EXECUTE FUNCTION "audit_event_prevent_mutation"();
