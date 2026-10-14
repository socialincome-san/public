# Audit log

Every write to an audited entity stores an audit event in `audit_event`:
who wrote it, from where, the entity's name and a snapshot of the entity
afterwards. What changed is computed when reading, by comparing
consecutive snapshots.

Audited models (`auditedModels` in `eslint.config.mjs`): recipient
(candidates are recipients too), payout, contributor, contribution,
subscription, donation certificate, local partner, campaign, survey,
expense, country, focus, mobile money provider, program, user and
organization. Pure logs and machine data are not audited: messages, sent
emails, exchange rates, payment events, reserves and bank accounts.

Child and join tables belong to one owner's snapshot and are written in
that owner's write repository: contacts, phones, addresses and payment
information to their person, program accesses, target focuses and survey
schedules to the program, organization accesses to the user, focus links
to the local partner, pending claims to the campaign. A module that
writes another module's data goes through that module's service, e.g.
the organization form sets program accesses through the programs service
and members through the users service.

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
row: pass `entityId` as a list for `updateMany`/`deleteMany`. Without
`entityId`, the ids come from the returned rows, e.g. of
`createManyAndReturn` or `updateManyAndReturn` when the rows are only
known afterwards.

Services pass who is acting: `getSessionAuditContext(session)` for
portal and partner space,
`getRecipientAuditContext(recipientId, 'mobile-app')` from the recipient
service for the app, with the recipient's name (survey answers use
`'website'`),
`{ actor: { type: 'system', id: '<job-or-route-name>' }, source: 'system' }`
for writes without a session (cron jobs, webhooks). `metadata` is flat
context such as `{ operation: 'csv-import', importId }`.

## Reading

`/portal/admin/audit-log` lists every audit event to admins, newest
first, paginated in the database and filtered by entity type or a search
on entity name, entity id and actor name. A name search lists every
event of a matching entity. Each row is diffed against the entity's
previous snapshot (`diffSnapshots`, paths like
`paymentInformation.phone.number`) and shows the entity's latest name.
Deleted entities stay listed. Entities that existed before auditing get
a `baseline` event with their state from
`npm run db:backfill:audit-baselines` (dry-run, `-- --apply` to write);
baselines are not listed, they only give the first change its diff. Type
labels and field labels come from `auditEntityTypes` in
`src/components/audit/audit-summary.ts`.

## Notes

- Firebase cannot join the transaction; services update it before the
  write and revert it if the write throws, as before.
- `audit_event` is append-only (database triggers).

## Auditing another model

1. Add the model to `auditedModels` in `eslint.config.mjs`; lint lists
   every write to move.
2. Rename `<module>.repository.ts` to `<module>.repository.read.ts` and
   move the writes into `<module>.repository.write.ts`, with an entity
   from `defineAuditedEntity`: `findSnapshot` selects every field of the
   entity and its owned relations, ordering lists so equal states
   compare equal, and `getName` builds the name the audit log shows and
   searches.
3. Pass an `AuditContext` from the service. Writes to other modules'
   data go through their services; if that splits a transaction, make
   each step safe to retry.
4. Add the type to `auditEntityTypes` in
   `src/components/audit/audit-summary.ts`: label and field labels.
