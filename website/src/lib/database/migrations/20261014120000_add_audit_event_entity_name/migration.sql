-- AlterTable
ALTER TABLE "audit_event" ADD COLUMN "entity_name" TEXT;

-- Before this migration only recipients were audited. Their name is derived
-- from the snapshot, like the application does for new events. The
-- append-only trigger is disabled for this one backfill only.
ALTER TABLE "audit_event" DISABLE TRIGGER "audit_event_append_only";

UPDATE "audit_event"
SET "entity_name" = NULLIF(TRIM(CONCAT_WS(' ', "snapshot" -> 'contact' ->> 'firstName', "snapshot" -> 'contact' ->> 'lastName')), '')
WHERE "entity_type" = 'recipient' AND "snapshot" IS NOT NULL;

ALTER TABLE "audit_event" ENABLE TRIGGER "audit_event_append_only";
