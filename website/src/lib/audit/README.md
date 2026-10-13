# Audit log

Every write to an audited entity stores an audit event in `audit_event`:
who wrote it, from where, and a snapshot of the entity afterwards. What
changed is computed when reading, by comparing consecutive snapshots.
Only recipients are audited so far.

## Writing

An audited module splits its repository into
`<module>.repository.read.ts` and `<module>.repository.write.ts`. An
audited model is written only in a write repository, each write through
`auditedWrite`. Lint rejects writes to it in every other repository and
the shared Prisma client in write repositories.

```ts
export const updateRecipient = async (audit: AuditContext, input, context) =>
	auditedWrite({ entity: recipientEntity, context: audit, action: 'update', entityId: input.id }, (transaction) =>
		transaction.recipient.update({ … }),
	);
```

`auditedWrite` runs the write, reads the snapshot
(`recipientAuditSnapshotSelect`, including contact, phones, address and
payment information) and stores it in the same transaction. If storing
the audit event fails, the write rolls back. Updates that change nothing
store no event; a delete stores an event without snapshot.

A write that changes several rows in one statement stores one event per
row: pass `entityId` as a list for `updateMany`/`deleteMany`, and
`create` takes the ids from the returned rows of `createManyAndReturn`.

Services pass who is acting: `getSessionAuditContext(session)` for
portal and partner space,
`{ actor: { type: 'recipient', id }, source: 'mobile-app' }` for the
app,
`{ actor: { type: 'system', id: '<job-or-route-name>' }, source: 'system' }`
for writes without a session (cron jobs, webhooks). `metadata` is flat
context such as `{ operation: 'csv-import', importId }`.

## Reading

`/portal/admin/audit-log` lists every audit event to admins, newest
first, paginated in the database and filtered by entity type or a search
on entity id and actor name. Each row is diffed against the entity's
previous snapshot (`diffSnapshots`, paths like
`paymentInformation.phone.number`). Deleted entities stay listed. Type
label, entity name (read from the latest snapshot) and field labels come
from `auditEntityTypes` in `src/components/audit/audit-summary.ts`.

## Notes

- Firebase cannot join the transaction; services update it before the
  write and revert it if the write throws, as before.
- `audit_event` is append-only (database triggers).

## Auditing another model

1. Add the model to `auditedModels` in `eslint.config.mjs`; lint lists
   every write to move.
2. Rename `<module>.repository.ts` to `<module>.repository.read.ts` and
   move the writes into `<module>.repository.write.ts`, with an
   `AuditedEntity` whose `findSnapshot` selects the fields to keep.
3. Pass an `AuditContext` from the service.
4. Add the type to `auditEntityTypes` in
   `src/components/audit/audit-summary.ts`: label, name paths and field
   labels.
