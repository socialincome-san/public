# Audit logging

Every write to an audited entity stores a new version in
`entity_version`: who wrote it, from where, and the entity's state
afterwards. What changed is computed when reading, by comparing
consecutive versions. Only recipients are audited so far.

## Writing

An audited module splits its repository:

- `recipient.repository.ts` only reads (lint rejects writes).
- `recipient.write.repository.ts` only writes, each write through
  `auditedWrite` (lint rejects the shared Prisma client there).

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

`getRecipientChangeTableView(userId, query)` lists versions of
recipients in programs the user operates, newest first, each diffed
against the recipient's previous version (`diffVersions`, paths like
`paymentInformation.phone.number`). It backs the portal home teaser and
`/portal/monitoring/recipient-changes`.

## Notes

- Firebase cannot join the transaction; services update it before the
  write and revert it if the write throws, as before.
- `entity_version` is append-only (database triggers).
- Candidates and program deletion also write recipient rows and are not
  versioned yet.
