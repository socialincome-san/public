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
the version fails, the write rolls back. A delete stores a version
without snapshot. Recipients that existed before versioning get a
`baseline` version of their current state on their first write, so that
write diffs against it.

Services pass who is acting: `getSessionAuditContext(session)` for
portal and partner space,
`{ actor: { type: 'recipient', id }, source: 'mobile-app' }` for the
app. `metadata` is flat context such as
`{ operation: 'csv-import', importId }`.

## Reading

`getRecipientAuditTrail(session, recipientId)` loads the versions, diffs
each against the previous one (`diffVersions`, paths like
`paymentInformation.phone.number`) and returns them newest first, for
whoever may read the recipient (only admins once it is deleted).

## Notes

- Firebase cannot join the transaction; services update it before the
  write and revert it if the write throws, as before.
- `entity_version` is append-only (database triggers).
- Candidates and program deletion also write recipient rows and are not
  versioned yet.
