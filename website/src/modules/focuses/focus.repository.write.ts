import type { Prisma } from '@/generated/prisma/client';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, defineAuditedEntity } from '@/lib/audit/audited-write';
import { focusPayloadSelect } from './focus.repository.read';
import type { FocusCreateInput, FocusUpdateInput } from './focus.schemas';

// Every write here stores a focus audit event in the same transaction.
// Reads live in focus.repository.read.ts.

export const createFocus = async (audit: AuditContext, input: FocusCreateInput) =>
	auditedWrite({ entity: focusEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.focus.create({
			data: input,
			select: focusPayloadSelect,
		}),
	);

export const updateFocus = async (audit: AuditContext, input: FocusUpdateInput) =>
	auditedWrite({ entity: focusEntity, context: audit, action: 'update', entityId: input.id }, (transaction) =>
		transaction.focus.update({
			where: { id: input.id },
			data: {
				name: input.name,
				slug: input.slug,
			},
			select: focusPayloadSelect,
		}),
	);

export const deleteFocus = async (audit: AuditContext, focusId: string) =>
	auditedWrite({ entity: focusEntity, context: audit, action: 'delete', entityId: focusId }, (transaction) =>
		transaction.focus.delete({
			where: { id: focusId },
			select: { id: true },
		}),
	);

const focusAuditSnapshotSelect = {
	name: true,
	slug: true,
} satisfies Prisma.FocusSelect;

export const focusEntity = defineAuditedEntity({
	type: 'focus',
	findSnapshot: (transaction, focusId) =>
		transaction.focus.findUnique({ where: { id: focusId }, select: focusAuditSnapshotSelect }),
	getName: ({ name }) => name,
});
