import {
	DonationInterval,
	SubscriptionPaymentMethod,
	SubscriptionStatus,
	type Subscription,
} from '@/generated/prisma/client';
import { type SubscriptionCancellationReason } from '@/generated/prisma/enums';
import { now } from '@/lib/utils/now';
import Stripe from 'stripe';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';
import { mapCoverTransactionCostsMetadata } from './cover-transaction-costs';
import { isSubscriptionAmountInRange, SUBSCRIPTION_AMOUNT_MAX, SUBSCRIPTION_AMOUNT_MIN } from './subscription-amount';
import {
	mapStripeSubscriptionFields,
	mapStripeSubscriptionLifecycle,
	mapStripeSubscriptionPriceFields,
	type UpsertBankStandingOrderInput,
} from './subscription.mappers';

export type SubscriptionUpsertResult = Pick<
	Subscription,
	'id' | 'stripeSubscriptionId' | 'bankStandingOrderReference' | 'campaignId' | 'status'
>;

const subscriptionSelect = {
	id: true,
	stripeSubscriptionId: true,
	bankStandingOrderReference: true,
	campaignId: true,
	status: true,
} as const;

export class SubscriptionWriteService extends BaseService {
	async upsertFromStripeSubscription(input: {
		stripeSubscription: Stripe.Subscription;
		contributorId: string;
		campaignId: string;
	}): Promise<ServiceResult<SubscriptionUpsertResult | null>> {
		const mapped = mapStripeSubscriptionFields(input.stripeSubscription);
		if (!mapped) {
			return this.resultOk(null);
		}

		const sharedFields = {
			contributorId: input.contributorId,
			campaignId: input.campaignId,
			amount: mapped.amount,
			currency: mapped.currency,
			interval: mapped.interval,
			status: mapped.status,
			paymentMethod: SubscriptionPaymentMethod.stripe,
			canceledAt: mapped.canceledAt,
			coverTransactionCosts: mapCoverTransactionCostsMetadata(input.stripeSubscription.metadata),
		};

		try {
			const subscription = await this.db.subscription.upsert({
				where: { stripeSubscriptionId: input.stripeSubscription.id },
				create: {
					stripeSubscriptionId: input.stripeSubscription.id,
					...sharedFields,
				},
				update: sharedFields,
				select: subscriptionSelect,
			});

			return this.resultOk(subscription);
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not upsert Stripe subscription: ${JSON.stringify(error)}`);
		}
	}

	/**
	 * Sync from customer.subscription.* webhooks.
	 * Updates status/canceledAt even without price fields when the row already exists.
	 */
	async syncFromStripeSubscriptionEvent(input: {
		stripeSubscription: Stripe.Subscription;
		contributorId: string;
		campaignId: string;
	}): Promise<ServiceResult<SubscriptionUpsertResult | null>> {
		const lifecycle = mapStripeSubscriptionLifecycle(input.stripeSubscription);
		if (!lifecycle) {
			return this.resultOk(null);
		}

		const priceFields = mapStripeSubscriptionPriceFields(input.stripeSubscription);
		if (priceFields) {
			return this.upsertFromStripeSubscription(input);
		}

		try {
			const existing = await this.db.subscription.findUnique({
				where: { stripeSubscriptionId: input.stripeSubscription.id },
				select: subscriptionSelect,
			});
			if (!existing) {
				console.warn('Cannot create Stripe subscription without price fields on lifecycle event', {
					stripeSubscriptionId: input.stripeSubscription.id,
					status: input.stripeSubscription.status,
				});

				return this.resultOk(null);
			}

			const subscription = await this.db.subscription.update({
				where: { id: existing.id },
				data: {
					status: lifecycle.status,
					canceledAt: lifecycle.canceledAt,
				},
				select: subscriptionSelect,
			});

			return this.resultOk(subscription);
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not sync Stripe subscription lifecycle: ${JSON.stringify(error)}`);
		}
	}

	async upsertFromBankStandingOrder(input: UpsertBankStandingOrderInput): Promise<ServiceResult<SubscriptionUpsertResult>> {
		const status = input.status ?? SubscriptionStatus.active;
		const canceledAt = input.canceledAt ?? null;
		const sharedFields = {
			contributorId: input.contributorId,
			campaignId: input.campaignId,
			amount: input.amount,
			currency: input.currency,
			interval: DonationInterval.monthly,
			status,
			paymentMethod: SubscriptionPaymentMethod.bank_transfer,
			canceledAt,
			coverTransactionCosts: false,
		};

		try {
			const subscription = await this.db.subscription.upsert({
				where: { bankStandingOrderReference: input.bankStandingOrderReference },
				create: {
					bankStandingOrderReference: input.bankStandingOrderReference,
					...sharedFields,
				},
				update: sharedFields,
				select: subscriptionSelect,
			});

			return this.resultOk(subscription);
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not upsert bank standing-order subscription: ${JSON.stringify(error)}`);
		}
	}

	async updateBankTransferAmount(input: {
		contributorId: string;
		subscriptionId: string;
		amount: number;
	}): Promise<ServiceResult<{ amount: number; currency: string }>> {
		try {
			const { contributorId, subscriptionId, amount } = input;
			if (!isSubscriptionAmountInRange(amount)) {
				return this.resultFail(
					`Amount must be an integer between ${SUBSCRIPTION_AMOUNT_MIN} and ${SUBSCRIPTION_AMOUNT_MAX}`,
				);
			}

			const subscription = await this.db.subscription.findFirst({
				where: {
					id: subscriptionId,
					contributorId,
					paymentMethod: SubscriptionPaymentMethod.bank_transfer,
					status: SubscriptionStatus.active,
				},
				select: { id: true, currency: true },
			});
			if (!subscription) {
				return this.resultFail('Subscription not found');
			}

			await this.db.subscription.update({
				where: { id: subscription.id },
				data: { amount },
			});

			return this.resultOk({ amount, currency: subscription.currency });
		} catch (error) {
			console.error(error);

			return this.resultFail('Could not update subscription amount');
		}
	}

	async cancelBankTransfer(input: {
		contributorId: string;
		subscriptionId: string;
		reason: SubscriptionCancellationReason;
	}): Promise<ServiceResult<void>> {
		try {
			const subscription = await this.db.subscription.findFirst({
				where: {
					id: input.subscriptionId,
					contributorId: input.contributorId,
					paymentMethod: SubscriptionPaymentMethod.bank_transfer,
				},
				select: { id: true, status: true },
			});
			if (!subscription || subscription.status === SubscriptionStatus.ended) {
				return this.resultFail('Subscription not found');
			}

			await this.db.subscription.update({
				where: { id: subscription.id },
				data: {
					status: SubscriptionStatus.ended,
					canceledAt: now(),
					cancellationReason: input.reason,
				},
			});

			return this.resultOk(undefined);
		} catch (error) {
			console.error(error);

			return this.resultFail('Could not cancel subscription');
		}
	}
}
