import type { Prisma } from '@/generated/prisma/client';
import type { ContributionStatus, Currency } from '@/generated/prisma/enums';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, type AuditedEntity } from '@/lib/audit/audited-write';
import { DateTime } from 'luxon';
import {
	contributionPayloadSelect,
	contributionRecordSelect,
	paymentEventRecordSelect,
} from './contribution.repository.read';
import type { BankTransferUpsertInput, PaymentEventCreateData, StripeContributionCreateData } from './contribution.types';

// Every write here stores a contribution audit event in the same
// transaction. Payment events are written with their contribution but are
// not part of its snapshot. Reads live in contribution.repository.read.ts.

type ContributionInput = {
	amount: number;
	currency: Currency;
	amountChf: number;
	feesChf: number;
	status: ContributionStatus;
	contributorId: string;
	campaignId: string;
};

export const createContribution = async (audit: AuditContext, input: ContributionInput) =>
	auditedWrite({ entity: contributionEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.contribution.create({
			data: toContributionData(input),
			select: contributionPayloadSelect,
		}),
	);

export const updateContribution = async (audit: AuditContext, contributionId: string, input: ContributionInput) =>
	auditedWrite({ entity: contributionEntity, context: audit, action: 'update', entityId: contributionId }, (transaction) =>
		transaction.contribution.update({
			where: { id: contributionId },
			data: toContributionData(input),
			select: contributionPayloadSelect,
		}),
	);

export const createContributionFromStripe = async (
	audit: AuditContext,
	contributionData: StripeContributionCreateData,
	paymentEventData: PaymentEventCreateData,
) =>
	auditedWrite({ entity: contributionEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.contribution.create({
			data: { ...contributionData, paymentEvent: { create: toPaymentEventData(paymentEventData) } },
			select: contributionRecordSelect,
		}),
	);

export const updateContributionFromStripe = async (
	audit: AuditContext,
	contributionId: string,
	contributionData: StripeContributionCreateData,
	paymentEventData: PaymentEventCreateData,
) =>
	auditedWrite({ entity: contributionEntity, context: audit, action: 'update', entityId: contributionId }, (transaction) =>
		transaction.contribution.update({
			where: { id: contributionId },
			data: { ...contributionData, paymentEvent: { update: toPaymentEventData(paymentEventData) } },
			select: contributionRecordSelect,
		}),
	);

export const createContributionFromBankTransfer = async (
	audit: AuditContext,
	input: BankTransferUpsertInput,
	suffixTransactionId: boolean,
) => {
	const contribution = await auditedWrite({ entity: contributionEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.contribution.create({
			data: {
				...toContributionData(input.contribution),
				paymentEvent: {
					create: toPaymentEventData({
						...input,
						transactionId: suffixTransactionId
							? `${input.transactionId}-${DateTime.now().toMillis().toString()}`
							: input.transactionId,
					}),
				},
			},
			select: { id: true, paymentEvent: { select: paymentEventRecordSelect } },
		}),
	);
	if (!contribution.paymentEvent) {
		throw new Error('Created contribution has no payment event.');
	}

	return contribution.paymentEvent;
};

export const updateContributionFromBankTransfer = async (
	audit: AuditContext,
	contributionId: string,
	input: BankTransferUpsertInput,
) => {
	const contribution = await auditedWrite(
		{ entity: contributionEntity, context: audit, action: 'update', entityId: contributionId },
		(transaction) =>
			transaction.contribution.update({
				where: { id: contributionId },
				data: {
					...toContributionData(input.contribution),
					paymentEvent: { update: toPaymentEventData(input) },
				},
				select: { paymentEvent: { select: paymentEventRecordSelect } },
			}),
	);
	if (!contribution.paymentEvent) {
		throw new Error('Updated contribution has no payment event.');
	}

	return contribution.paymentEvent;
};

const contributionAuditSnapshotSelect = {
	legacyFirestoreId: true,
	amount: true,
	currency: true,
	amountChf: true,
	feesChf: true,
	status: true,
	contributorId: true,
	campaignId: true,
} satisfies Prisma.ContributionSelect;

const contributionEntity: AuditedEntity = {
	type: 'contribution',
	findSnapshot: (transaction, contributionId) =>
		transaction.contribution.findUnique({ where: { id: contributionId }, select: contributionAuditSnapshotSelect }),
};

const toContributionData = (input: ContributionInput) => ({
	amount: input.amount,
	currency: input.currency,
	amountChf: input.amountChf,
	feesChf: input.feesChf,
	status: input.status,
	contributorId: input.contributorId,
	campaignId: input.campaignId,
});

const toPaymentEventData = (input: PaymentEventCreateData) => ({
	type: input.type,
	transactionId: input.transactionId,
	metadata: toInputJsonObject(input.metadata),
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const toInputJsonValue = (value: unknown): Prisma.InputJsonValue | null | undefined => {
	if (value === null) {
		return null;
	}
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return value;
	}
	if (Array.isArray(value)) {
		return value.flatMap((item) => {
			const json = toInputJsonValue(item);

			return json === undefined ? [] : [json];
		});
	}
	if (isRecord(value)) {
		return toInputJsonObject(value);
	}

	return undefined;
};

const toInputJsonObject = (metadata: Record<string, unknown> | undefined): Prisma.InputJsonValue | undefined => {
	if (!metadata) {
		return undefined;
	}

	const entries: [string, Prisma.InputJsonValue | null][] = [];
	for (const [key, value] of Object.entries(metadata)) {
		const json = toInputJsonValue(value);
		if (json !== undefined) {
			entries.push([key, json]);
		}
	}

	return Object.fromEntries(entries);
};
