import { DonationInterval, SubscriptionStatus } from '@/generated/prisma/enums';
import {
	mapStripePriceAmount,
	mapStripeRecurringInterval,
	mapStripeSubscriptionFields,
	mapStripeSubscriptionLifecycle,
	mapStripeSubscriptionPriceFields,
	mapStripeSubscriptionStatus,
	resolveStripeResourceId,
	resolveStripeSubscriptionIdFromInvoice,
	shouldSkipStripeSubscriptionStatus,
} from './subscription.mappers';

describe('subscription.mappers', () => {
	describe('stripe status and interval', () => {
		test('skips incomplete statuses', () => {
			expect(shouldSkipStripeSubscriptionStatus('incomplete')).toBe(true);
			expect(shouldSkipStripeSubscriptionStatus('active')).toBe(false);
		});

		test('maps statuses', () => {
			expect(mapStripeSubscriptionStatus('active', null)).toBe(SubscriptionStatus.active);
			expect(mapStripeSubscriptionStatus('past_due', null)).toBe(SubscriptionStatus.active);
			expect(mapStripeSubscriptionStatus('canceled', null)).toBe(SubscriptionStatus.canceled);
			expect(mapStripeSubscriptionStatus('canceled', 1_700_000_000)).toBe(SubscriptionStatus.ended);
			expect(mapStripeSubscriptionStatus('incomplete', null)).toBeNull();
		});

		test('maps intervals and amounts', () => {
			expect(mapStripeRecurringInterval('month', 1)).toBe(DonationInterval.monthly);
			expect(mapStripeRecurringInterval('month', 3)).toBeNull();
			expect(mapStripeRecurringInterval('year', 1)).toBeNull();
			expect(mapStripeRecurringInterval('week', 1)).toBeNull();
			expect(mapStripePriceAmount(1200)).toBe(12);
			expect(mapStripePriceAmount(null)).toBeNull();
		});
	});

	describe('resolve helpers', () => {
		test('resolveStripeResourceId', () => {
			expect(resolveStripeResourceId('sub_1')).toBe('sub_1');
			expect(resolveStripeResourceId({ id: 'sub_2' })).toBe('sub_2');
			expect(resolveStripeResourceId(null)).toBeNull();
		});

		test('resolveStripeSubscriptionIdFromInvoice uses parent.subscription_details', () => {
			expect(
				resolveStripeSubscriptionIdFromInvoice({
					parent: {
						subscription_details: { subscription: 'sub_parent' },
						quote_details: null,
						type: 'subscription_details',
					},
				} as never),
			).toBe('sub_parent');
		});

		test('resolveStripeSubscriptionIdFromInvoice falls back to legacy subscription', () => {
			expect(
				resolveStripeSubscriptionIdFromInvoice({
					parent: null,
					subscription: 'sub_legacy',
				} as never),
			).toBe('sub_legacy');
		});
	});

	describe('mapStripeSubscriptionLifecycle', () => {
		test('maps canceled without price items', () => {
			expect(
				mapStripeSubscriptionLifecycle({
					id: 'sub_1',
					status: 'canceled',
					ended_at: null,
					canceled_at: 1_700_000_000,
					metadata: { campaignId: 'camp_1' },
					items: { data: [] },
				} as never),
			).toEqual({
				status: SubscriptionStatus.canceled,
				canceledAt: new Date(1_700_000_000 * 1000),
			});
		});

		test('returns null for incomplete', () => {
			expect(
				mapStripeSubscriptionLifecycle({
					id: 'sub_1',
					status: 'incomplete',
					ended_at: null,
					canceled_at: null,
					metadata: {},
					items: { data: [] },
				} as never),
			).toBeNull();
		});
	});

	describe('mapStripeSubscriptionPriceFields', () => {
		test('returns null when price is missing', () => {
			expect(
				mapStripeSubscriptionPriceFields({
					id: 'sub_1',
					items: { data: [] },
				} as never),
			).toBeNull();
		});
	});

	describe('mapStripeSubscriptionFields', () => {
		test('maps a complete subscription', () => {
			const mapped = mapStripeSubscriptionFields({
				id: 'sub_1',
				status: 'active',
				ended_at: null,
				canceled_at: null,
				metadata: { campaignId: 'camp_1' },
				items: {
					data: [
						{
							price: {
								unit_amount: 5000,
								currency: 'chf',
								recurring: { interval: 'month', interval_count: 1 },
							},
						},
					],
				},
			} as never);

			expect(mapped).toEqual({
				amount: 50,
				currency: 'CHF',
				interval: DonationInterval.monthly,
				status: SubscriptionStatus.active,
				canceledAt: null,
			});
		});

		test('returns null for incomplete', () => {
			expect(
				mapStripeSubscriptionFields({
					id: 'sub_1',
					status: 'incomplete',
					ended_at: null,
					canceled_at: null,
					metadata: {},
					items: { data: [] },
				} as never),
			).toBeNull();
		});

		test('returns null when status maps but price is missing', () => {
			expect(
				mapStripeSubscriptionFields({
					id: 'sub_1',
					status: 'canceled',
					ended_at: null,
					canceled_at: 1_700_000_000,
					metadata: {},
					items: { data: [] },
				} as never),
			).toBeNull();
		});
	});
});
