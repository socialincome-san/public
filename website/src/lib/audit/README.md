# Audit logging

Business writes record who changed what, when, from which value to which
value and through which app area, in the `audit_event` table. It is an
audit trail, not event sourcing.

## Writing

```ts
const result = await withAudit(
	{
		entity: recipientAuditEntity,
		action: 'update',
		entityId: recipientId,
		...getSessionAuditContext(session),
	},
	async (transaction) =>
		resultOk(
			await recipientRepository.updateRecipient(
				transaction,
				input,
				context,
			),
		),
);
```

In one database transaction `withAudit` locks and snapshots the
entities, runs the callback, snapshots again and inserts one event per
changed entity. A failed `Result` rolls back and is returned; an
exception, including a failed audit insert, rolls back and is rethrown.
Updates that change nothing audited record nothing. `create` reads the
new id from the returned row.

Services never see Prisma: they pass the opaque `AuditedTransaction` to
repository functions, which write through `getTransactionClient`.

Actors: `getSessionAuditContext(session)`, `{ type: 'recipient', id }`
with source `mobile-app`, or `{ type: 'system', id: 'job-name' }` with
source `system`. `metadata` is flat operation context such as
`{ operation: 'csv-import', importId }`, never personal data.

## Entities

An entity is a logical aggregate: the recipient includes its contact,
phones, address and payment information, so a payment phone change is
recorded as `paymentInformation.phone.number` on the recipient. Its
definition in the service has:

- `findSnapshots`: a repository function that locks the rows
  (`SELECT … FOR UPDATE`) and selects the snapshot. The lock serializes
  concurrent writes, so old values are always exact.
- `fields`: every snapshot leaf classified (TypeScript enforces it).
  `plain` stores values; `personal` stores values on update but only
  `{ redacted: true }` on create and delete, so the trail never keeps a
  full copy of a person.

To add one: add the type to `AUDITED_ENTITY_TYPES` (`modules/audit`) and
its authorizer in `audit.service.ts`, write the snapshot loader and
policy, make the write functions take `AuditedTransaction`, and wrap the
service writes in `withAudit`.

## External systems

Firebase cannot join the transaction. It is updated before the audited
write and reverted if the write fails. When creating the Firebase user
fails after a recipient was created, the recipient is deleted again with
its own `delete` event (`reason: authentication-user-creation-failed`).

## Reading

`getAuditTrail(session, { entityType, entityId, limit })` returns the
newest events after asking the owning module whether the session may
read that entity.

## Guarantees

- Write and event commit or roll back together (one transaction).
- `audit_event` is append-only (database trigger).
- Repository write functions need an `AuditedTransaction`, which only
  `withAudit` creates; services cannot import the adapter.
- Lint rejects `prisma.recipient` and `prisma.paymentInformation` writes
  on the shared client.

Not enforced: writes inside a raw `prisma.$transaction` callback, seeds,
scripts and modules that are not migrated yet. Program deletion records
the unassigned recipients, not the program itself.
