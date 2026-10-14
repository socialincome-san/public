import type { Prisma } from '@/generated/prisma/client';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, defineAuditedEntity } from '@/lib/audit/audited-write';
import { expensePayloadSelect } from './expense.repository.read';
import type { ExpenseCreateInput, ExpenseUpdateInput } from './expense.schemas';

// Every write here stores an expense audit event in the same transaction.
// Reads live in expense.repository.read.ts.

export const createExpense = async (audit: AuditContext, input: ExpenseCreateInput) =>
	auditedWrite({ entity: expenseEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.expense.create({
			data: {
				type: input.type,
				year: input.year,
				amountChf: input.amountChf,
				organization: {
					connect: { id: input.organizationId },
				},
			},
			select: expensePayloadSelect,
		}),
	);

export const updateExpense = async (audit: AuditContext, input: ExpenseUpdateInput) =>
	auditedWrite({ entity: expenseEntity, context: audit, action: 'update', entityId: input.id }, (transaction) =>
		transaction.expense.update({
			where: { id: input.id },
			data: {
				type: input.type,
				year: input.year,
				amountChf: input.amountChf,
				organization: {
					connect: { id: input.organizationId },
				},
			},
			select: expensePayloadSelect,
		}),
	);

const expenseAuditSnapshotSelect = {
	legacyFirestoreId: true,
	organizationId: true,
	type: true,
	year: true,
	amountChf: true,
} satisfies Prisma.ExpenseSelect;

const expenseEntity = defineAuditedEntity({
	type: 'expense',
	findSnapshot: (transaction, expenseId) =>
		transaction.expense.findUnique({ where: { id: expenseId }, select: expenseAuditSnapshotSelect }),
	getName: ({ type, year }) => `${type} ${year}`,
});
