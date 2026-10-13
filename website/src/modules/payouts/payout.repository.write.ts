import type { Prisma } from '@/generated/prisma/client';
import type { PayoutStatus } from '@/generated/prisma/enums';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, type AuditedEntity } from '@/lib/audit/audited-write';
import { payoutPayloadSelect, payoutRecordSelect } from './payout.repository.read';
import type { CreatePayoutInput, UpdatePayoutInput } from './payout.schemas';
import type { PayoutProcessCreateInput } from './payout.types';

// Every write here stores a payout audit event in the same transaction.
// Reads live in payout.repository.read.ts.

export const createPayoutProcessPayouts = async (audit: AuditContext, inputs: PayoutProcessCreateInput[]) =>
	auditedWrite({ entity: payoutEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.payout.createManyAndReturn({
			data: inputs.map(({ recipientId, amount, amountChf, currency, status, paymentAt, phoneNumber }) => ({
				recipientId,
				amount,
				amountChf,
				currency,
				status,
				paymentAt,
				phoneNumber,
				comments: null,
			})),
			select: { id: true },
		}),
	);

export const createPayout = async (audit: AuditContext, input: CreatePayoutInput) =>
	auditedWrite({ entity: payoutEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.payout.create({
			data: {
				recipientId: input.recipientId,
				amount: input.amount,
				amountChf: input.amountChf,
				currency: input.currency,
				status: input.status,
				paymentAt: input.paymentAt,
				phoneNumber: input.phoneNumber,
				comments: input.comments,
			},
			select: payoutPayloadSelect,
		}),
	);

export const updatePayout = async (audit: AuditContext, input: UpdatePayoutInput) =>
	auditedWrite({ entity: payoutEntity, context: audit, action: 'update', entityId: input.id }, (transaction) =>
		transaction.payout.update({
			where: { id: input.id },
			data: {
				recipientId: input.recipientId,
				amount: input.amount,
				amountChf: input.amountChf,
				currency: input.currency,
				status: input.status,
				paymentAt: input.paymentAt,
				phoneNumber: input.phoneNumber,
				comments: input.comments,
			},
			select: payoutPayloadSelect,
		}),
	);

export const updatePayoutStatus = async (audit: AuditContext, payoutId: string, status: PayoutStatus) =>
	auditedWrite({ entity: payoutEntity, context: audit, action: 'update', entityId: payoutId }, (transaction) =>
		transaction.payout.update({
			where: { id: payoutId },
			data: { status },
			select: { id: true },
		}),
	);

export const updatePayoutStatusByRecipient = async (
	audit: AuditContext,
	payoutId: string,
	status: PayoutStatus,
	comments: string | null | undefined,
) =>
	auditedWrite({ entity: payoutEntity, context: audit, action: 'update', entityId: payoutId }, (transaction) =>
		transaction.payout.update({
			where: { id: payoutId },
			data: { status, comments },
			select: payoutRecordSelect,
		}),
	);

export const deletePayout = async (audit: AuditContext, payoutId: string) =>
	auditedWrite({ entity: payoutEntity, context: audit, action: 'delete', entityId: payoutId }, (transaction) =>
		transaction.payout.delete({
			where: { id: payoutId },
			select: { id: true },
		}),
	);

const payoutAuditSnapshotSelect = {
	legacyFirestoreId: true,
	recipientId: true,
	amount: true,
	amountChf: true,
	currency: true,
	paymentAt: true,
	status: true,
	phoneNumber: true,
	comments: true,
} satisfies Prisma.PayoutSelect;

const payoutEntity: AuditedEntity = {
	type: 'payout',
	findSnapshot: (transaction, payoutId) =>
		transaction.payout.findUnique({ where: { id: payoutId }, select: payoutAuditSnapshotSelect }),
};
