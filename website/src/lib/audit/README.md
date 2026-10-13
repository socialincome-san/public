# Audit logging

Writes to audited modules record who changed what, when, from which
value to which value and through which app area, in the `audit_event`
table. Only recipients are audited so far.

## Read and write repositories

An audited module splits its repository:

- `recipient.repository.ts` only reads (lint rejects writes).
- `recipient.write.repository.ts` only writes, and every write goes
  through `auditedWrite` (lint rejects importing the shared Prisma
  client).

Services pass who is acting as the first argument:

```ts
await recipientWriteRepository.updateRecipient(
	getSessionAuditContext(session),
	input,
	context,
);
```

Use `getSessionAuditContext(session)` for portal and partner-space
writes, `{ actor: { type: 'recipient', id }, source: 'mobile-app' }` for
the app, and
`{ actor: { type: 'system', id: 'job-name' }, source: 'system' }` for
jobs. `metadata` is flat context such as
`{ operation: 'csv-import', importId }`, never personal data.

## auditedWrite

`auditedWrite` (`lib/database/audited-write.ts`) runs the write in one
transaction: lock and snapshot the entity, write, snapshot again, store
the diff. If storing the event fails, the write rolls back. Updates that
change nothing audited store nothing.

The entity definition in the write repository has:

- `findSnapshot`: locks the row (`SELECT … FOR UPDATE`) and selects the
  snapshot. The lock serializes concurrent writes, so old values are
  exact. `occurred_at` is the insert time, so ordering follows the lock.
- `fields`: every snapshot leaf classified (TypeScript enforces it).
  `plain` stores values; `personal` stores values on update but only
  `{ redacted: true }` on create and delete.

The recipient snapshot includes its contact, phones, address and payment
information, so a payment phone change is recorded as
`paymentInformation.phone.number` on the recipient.

## Firebase

Firebase cannot join the transaction. Services update it before the
write and revert it if the write throws. When creating the Firebase user
fails after a recipient was created, the recipient is deleted again with
its own `delete` event (`reason: authentication-user-creation-failed`).

## Reading

`getRecipientAuditTrail(session, recipientId)` returns the newest events
to whoever may read the recipient; for deleted recipients and pool
candidates only admins.

## Not covered yet

Candidates and program deletion also write recipient rows and are not
audited yet. `audit_event` is append-only (database trigger); erasure
needs a migration that lifts it.
