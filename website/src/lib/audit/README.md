# Audit logging

Every write to an audited entity stores a new version in
`entity_version`: who wrote it, from where, and the entity's state
afterwards. What changed is computed when reading, by comparing
consecutive versions. Only recipients are audited so far.

## Writing

An audited model is written only in its module's
`*.write.repository.ts`, each write through `auditedWrite`. Lint rejects
writes to it in every other repository and the shared Prisma client in
write repositories.

```ts
export const updateRecipient = async (audit: AuditContext, input, context) =>
	auditedWrite({ entity: recipientEntity, context: audit, action: 'update', entityId: input.id }, (transaction) =>
		transaction.recipient.update({ … }),
	);
```

`auditedWrite` runs the write, reads the snapshot
(`recipientVersionSelect`, including contact, phones, address and
payment information) and stores it in the same transaction. If storing
the version fails, the write rolls back. Updates that change nothing
store no version; a delete stores a version without snapshot.

Services pass who is acting: `getSessionAuditContext(session)` for
portal and partner space,
`{ actor: { type: 'recipient', id }, source: 'mobile-app' }` for the
app. `metadata` is flat context such as
`{ operation: 'csv-import', importId }`.

## Reading

`/portal/monitoring/changes` lists every change the user may see, newest
first, each diffed against the entity's previous version
(`diffVersions`, paths like `paymentInformation.phone.number`).
`getChangeTableView` (`modules/changes`) asks each versioned entity type
which entities the user may see; recipients answer with
`getRecipientsForChangeLog` (recipients in programs they operate). To
show a new entity type, see below.

## Notes

- Firebase cannot join the transaction; services update it before the
  write and revert it if the write throws, as before.
- `entity_version` is append-only (database triggers).
- Candidates and program deletion also write recipient rows and are not
  versioned yet (`unauditedWriteRepositories` in `eslint.config.mjs`).

## Auditing another model

1. Add the model to `auditedModels` in `eslint.config.mjs`; lint lists
   every write to move.
2. Move them into `<module>.write.repository.ts`, with a
   `VersionedEntity` whose `findSnapshot` selects the fields to keep.
3. Pass an `AuditContext` from the service.
4. To show its changes, add a loader to `changeLogSources` and field
   labels to `src/components/changes/change-summary.ts`.
