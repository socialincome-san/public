import type { Prisma } from '@/generated/prisma/client';
import {
	DonationInterval,
	SubscriptionPaymentMethod,
	SubscriptionStatus,
	type SubscriptionCancellationReason,
} from '@/generated/prisma/enums';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, type AuditedEntity } from '@/lib/audit/audited-write';
import { subscriptionUpsertSelect } from './subscription.repository.read';
import type { StripeSubscriptionInput, UpsertBankStandingOrderInput } from './subscription.types';

// Every write here stores a subscription audit event in the same
// transaction. Reads live in subscription.repository.read.ts.

export const createBankStandingOrder = async (audit: AuditContext, input: UpsertBankStandingOrderInput) =>
	auditedWrite({ entity: subscriptionEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.subscription.create({
			data: {
				bankStandingOrderReference: input.bankStandingOrderReference,
				contributorId: input.contributorId,
				...toBankStandingOrderData(input),
			},
			select: subscriptionUpsertSelect,
		}),
	);

export const updateBankStandingOrder = async (
	audit: AuditContext,
	subscriptionId: string,
	input: UpsertBankStandingOrderInput,
) =>
	auditedWrite({ entity: subscriptionEntity, context: audit, action: 'update', entityId: subscriptionId }, (transaction) =>
		transaction.subscription.update({
			where: { id: subscriptionId },
			data: toBankStandingOrderData(input),
			select: subscriptionUpsertSelect,
		}),
	);

export const createStripeSubscription = async (audit: AuditContext, input: StripeSubscriptionInput) =>
	auditedWrite({ entity: subscriptionEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.subscription.create({
			data: { stripeSubscriptionId: input.stripeSubscriptionId, ...toStripeSubscriptionData(input) },
			select: { id: true },
		}),
	);

export const updateStripeSubscription = async (
	audit: AuditContext,
	subscriptionId: string,
	input: StripeSubscriptionInput,
) =>
	auditedWrite({ entity: subscriptionEntity, context: audit, action: 'update', entityId: subscriptionId }, (transaction) =>
		transaction.subscription.update({
			where: { id: subscriptionId },
			data: toStripeSubscriptionData(input),
			select: { id: true },
		}),
	);

export const updateSubscriptionAmount = async (audit: AuditContext, subscriptionId: string, amount: number) =>
	auditedWrite({ entity: subscriptionEntity, context: audit, action: 'update', entityId: subscriptionId }, (transaction) =>
		transaction.subscription.update({
			where: { id: subscriptionId },
			data: { amount },
			select: { id: true },
		}),
	);

export const updateSubscriptionLifecycle = async (
	audit: AuditContext,
	input: {
		subscriptionId: string;
		status: SubscriptionStatus;
		canceledAt: Date | null;
		cancellationReason?: SubscriptionCancellationReason;
	},
) =>
	auditedWrite(
		{ entity: subscriptionEntity, context: audit, action: 'update', entityId: input.subscriptionId },
		(transaction) =>
			transaction.subscription.update({
				where: { id: input.subscriptionId },
				data: {
					status: input.status,
					canceledAt: input.canceledAt,
					cancellationReason: input.cancellationReason,
				},
				select: { id: true },
			}),
	);

const subscriptionAuditSnapshotSelect = {
	contributorId: true,
	campaignId: true,
	amount: true,
	currency: true,
	interval: true,
	status: true,
	paymentMethod: true,
	stripeSubscriptionId: true,
	bankStandingOrderReference: true,
	canceledAt: true,
	cancellationReason: true,
	coverTransactionCosts: true,
} satisfies Prisma.SubscriptionSelect;

const subscriptionEntity: AuditedEntity = {
	type: 'subscription',
	findSnapshot: (transaction, subscriptionId) =>
		transaction.subscription.findUnique({ where: { id: subscriptionId }, select: subscriptionAuditSnapshotSelect }),
};

const toBankStandingOrderData = (input: UpsertBankStandingOrderInput) => ({
	campaignId: input.campaignId,
	amount: input.amount,
	currency: input.currency,
	interval: DonationInterval.monthly,
	status: input.status ?? SubscriptionStatus.active,
	paymentMethod: SubscriptionPaymentMethod.bank_transfer,
	canceledAt: input.canceledAt ?? null,
	coverTransactionCosts: false,
});

const toStripeSubscriptionData = (input: StripeSubscriptionInput) => ({
	contributorId: input.contributorId,
	campaignId: input.campaignId,
	amount: input.amount,
	currency: input.currency,
	interval: input.interval,
	status: input.status,
	paymentMethod: SubscriptionPaymentMethod.stripe,
	canceledAt: input.canceledAt,
	coverTransactionCosts: input.coverTransactionCosts,
});
