# Audit logging

Every business write records who changed what, when, from which value to
which value and through which app area. This is an audit trail, not
event sourcing: the tables stay the source of truth and `audit_event`
explains how they got there.

## Pieces

| File                                                       | Role                                                                                                                                                        |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/audit/with-audit.ts`                                  | `withAudit`, the only way to start a write transaction. Also `getSessionAuditContext` and `systemActor`.                                                    |
| `lib/audit/audit-changes.ts`                               | Diffs two snapshots with a field policy.                                                                                                                    |
| `lib/audit/audit-types.ts`                                 | Actors, sources, changes, `AuditedEntity`.                                                                                                                  |
| `lib/database/audited-transaction.ts`                      | Prisma adapter: opens the transaction, hands out the opaque `AuditedTransaction`, inserts events. The only Prisma-specific audit code besides repositories. |
| `lib/database/unaudited-write.ts`                          | Marker for reviewed technical writes that change no business entity.                                                                                        |
| `modules/audit`                                            | Read API (`getAuditTrail`, `getAuditTrailAction`) with per-entity authorization.                                                                            |
| `eslint-rules/backend-architecture.mjs` (`audited-writes`) | Enforcement, see below.                                                                                                                                     |

## How a write is recorded

```ts
// recipient.service.ts
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

Inside one database transaction `withAudit`

1. locks and snapshots the target entities (`entity.findSnapshots`),
2. runs the callback with the `AuditedTransaction`,
3. snapshots again, diffs with the entity's field policy and inserts one
   `audit_event` per changed entity.

- A failed `Result` from the callback rolls back and is returned as is.
- An exception, including a failed audit insert, rolls back and is
  rethrown. Services keep their `try/catch`.
- An update that changes no audited field records nothing.
- `create` takes the new id from the returned row's `id`.
- `entityId` may be a list for bulk operations (one event per entity).

Services never see Prisma: the callback receives an opaque handle and
passes it to repository functions, which unwrap it with
`getTransactionClient(transaction)`. The handle is revoked when the
transaction ends.

## Entities and field policies

An entity is a logical aggregate, not a table. The recipient entity
covers its contact, phones, address and payment information, so a
payment phone change is recorded on the recipient as
`paymentInformation.phone.number`.

```ts
export const recipientAuditEntity: AuditedEntity<RecipientAuditSnapshot> =
	{
		type: 'recipient' satisfies AuditedEntityType,
		findSnapshots: recipientRepository.findRecipientAuditSnapshots,
		fields: {
			programId: 'plain',
			'contact.firstName': 'personal',
			'paymentInformation.phone.number': 'personal',
			// every other leaf of the snapshot …
		},
	};
```

The snapshot is an explicit `select` in the repository, never a raw row.
Every leaf must be classified (TypeScript fails otherwise), so a new
column is never stored by accident:

| Classification | update                     | create / delete            |
| -------------- | -------------------------- | -------------------------- |
| `plain`        | old and new value          | value                      |
| `personal`     | old and new value          | `{ path, redacted: true }` |
| `secret`       | `{ path, redacted: true }` | `{ path, redacted: true }` |

Personal values are kept for updates because that is what the trail is
for (who changed the payment phone to what). Create and delete never
copy a whole person into the trail. Dates are stored as ISO strings,
missing relations read as `null`, arrays compare by content.

`metadata` is a flat record for operation context such as
`{ operation: 'csv-import', importId }` or
`{ reason: 'authentication-user-creation-failed' }`. Never put personal
data in it.

## Concurrency

`findSnapshots` must lock what it returns. The recipient repository runs
`SELECT … FOR UPDATE` on the recipient rows, ordered by id. Every
audited recipient write takes this lock first, so concurrent writes
serialize and each event's old values are exactly the previous event's
new values.

Services that prepare a write outside the transaction (for example a
Firebase update based on the current payment phone) re-read inside the
callback and fail with a "changed in the meantime" error if their
assumption no longer holds. See `updateRecipient`.

## External systems

Firebase cannot join a PostgreSQL transaction, so the existing
compensation order is kept:

- Firebase is updated before the audited database write. If the write or
  its audit insert fails, the service reverts Firebase.
- On create, the database write (and its `create` event) commits first.
  If creating the Firebase user then fails, the recipient is deleted
  again with its own `delete` event carrying
  `metadata.reason = 'authentication-user-creation-failed'`.
- On delete, a failed Firebase deletion only logs a warning, as before.
  The audit event records the database deletion.
- If a compensation itself fails, the database and Firebase disagree and
  the error is logged; the audit trail still reflects the database.

## Reading the trail

`getAuditTrail(session, query)` in `modules/audit` returns newest events
first with a cursor (`nextCursor`) and optional filters for actor,
action and date range. It always needs an entity. Before reading, it
asks the owning module whether the session may read that entity's trail
(`authorizeRecipientAuditTrail`): the same people who can read the
recipient, admins for pool candidates, and only admins once a recipient
is deleted.

## Enforcement

| Guarantee                                                                                                                                                                       | Mechanism                                                                                                   | Kind           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------- |
| Writes to `recipient` and `paymentInformation` go through an `AuditedTransaction`, in every file                                                                                | `audited-writes` lint rule (`auditedModels`)                                                                | static         |
| Repositories not in the legacy baseline write only through `getTransactionClient`, never `prisma.*.create/update/delete…`, `$transaction` or `$executeRaw` on the shared client | `audited-writes` lint rule (`requireAuditedWrites`)                                                         | static         |
| Only repositories unwrap an `AuditedTransaction`; only `lib/audit` can open one or insert events                                                                                | `audited-writes` lint rule, opaque type                                                                     | static         |
| Services cannot write without a handle                                                                                                                                          | repository write functions require `AuditedTransaction`                                                     | static (types) |
| The legacy baseline only shrinks                                                                                                                                                | `eslint-rules/audited-writes-baseline.test.mjs` fails when a listed repository has no unaudited writes left | static (test)  |
| A handle cannot be used after its transaction                                                                                                                                   | `getTransactionClient` throws                                                                               | runtime        |
| Business write and audit event commit or roll back together                                                                                                                     | one database transaction in `withAudit`                                                                     | runtime        |
| Audit events are append-only                                                                                                                                                    | `audit_event_append_only` trigger rejects `UPDATE` and `DELETE`                                             | database       |

What remains convention:

- The database does not refuse an unaudited write to `recipient`. Code
  lint does not see (seeds, raw SQL, a disabled rule, a manual `psql`
  session) can still write. A trigger that requires an audit context
  would break the previous deployment during rollout, so it is a
  follow-up once all writers are migrated.
- Lint follows the Prisma client by name. Passing it through an unusual
  alias (`const db = someObject.prisma`) is not detected.
- Field classifications and snapshot contents are reviewed by humans.

## Exemptions

- `unauditedWrite('orphan-cleanup', …)`: deleting phone and address rows
  that nothing references anymore. It changes no entity: the recipient
  snapshot already shows the relation going away. Add new reasons to
  `UnauditedWriteReason` only after review. It never exempts audited
  models.
- `src/lib/database/**`: migrations, seeds and the adapter.
- `src/scripts/**`: maintenance scripts. They are still blocked from
  writing audited models.
- Tests.
- `eslint-rules/audited-writes-baseline.mjs` lists repositories written
  before audit logging. Their writes are not audited yet.

## Adding an audited entity

1. Add the type to `AUDITED_ENTITY_TYPES` in
   `modules/audit/audit.types.ts`. TypeScript then requires an
   authorizer in `audit.service.ts`; export it from the owning service
   (`authorize<Entity>AuditTrail`).
2. In the repository, add `find<Entity>AuditSnapshots(transaction, ids)`
   that locks the rows (`SELECT … FOR UPDATE`) and selects the logical
   snapshot, including related rows that belong to the entity.
3. Define `<entity>AuditEntity` in the service and classify every leaf.
4. Make write functions take `transaction: AuditedTransaction` first and
   write through `getTransactionClient(transaction)`. Drop
   `prisma.$transaction`: `withAudit` is the transaction.
5. Wrap each service write in `withAudit` with the session context
   (`getSessionAuditContext`), `{ type: 'recipient', id }` for the
   mobile app, or `systemActor('job-name')` with source `system` for
   jobs.
6. Add the model to `auditedModels` in
   `eslint-rules/audited-writes-baseline.mjs` and remove the repository
   from `unauditedLegacyRepositories`.
7. Test the events with the fake from `audited-transaction.fake.ts` (see
   `recipient-audit.service.test.ts`).

## Limitations

- Program deletion records that each recipient lost its program; the
  program itself is not an audited entity yet.
- Phone rows can be shared between contacts. The recipient lock does not
  cover writes to a shared phone from another, not yet audited module.
- Audit events keep personal values of updates after a recipient is
  deleted. Retention or erasure needs a reviewed migration that lifts
  the append-only trigger.
- Reads are per entity; there is no global activity feed yet.
