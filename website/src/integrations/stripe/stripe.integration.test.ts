import { DonationInterval, SubscriptionStatus } from '@/generated/prisma/enums';
import {
	mapStripePriceAmount,
	mapStripeRecurringInterval,
	mapStripeSubscriptionFields,
	mapStripeSubscriptionLifecycle,
	mapStripeSubscriptionPriceFields,
	mapStripeSubscriptionStatus,
	resolveStripeResourceId,
	resolveStripeSubscriptionCanceledAt,
	resolveStripeSubscriptionIdFromInvoice,
	shouldSkipStripeSubscriptionStatus,
} from './stripe.integration';

describe('resolveStripeResourceId', () => {
	test('returns string ids, object ids, and null', () => {
		expect(resolveStripeResourceId('cus_1')).toBe('cus_1');
		expect(resolveStripeResourceId({ id: 'cus_2' })).toBe('cus_2');
		expect(resolveStripeResourceId(null)).toBe(null);
		expect(resolveStripeResourceId(undefined)).toBe(null);
	});
});

describe('resolveStripeSubscriptionIdFromInvoice', () => {
	test('reads the parent subscription details first', () => {
		expect(
			resolveStripeSubscriptionIdFromInvoice({
				parent: { subscription_details: { subscription: 'sub_parent' } },
			}),
		).toBe('sub_parent');
	});

	test('falls back to the legacy subscription field', () => {
		expect(
			resolveStripeSubscriptionIdFromInvoice({
				subscription: { id: 'sub_legacy' },
			}),
		).toBe('sub_legacy');
	});
});

describe('stripe subscription mapping', () => {
	test('skips incomplete statuses', () => {
		expect(shouldSkipStripeSubscriptionStatus('incomplete')).toBe(true);
		expect(shouldSkipStripeSubscriptionStatus('active')).toBe(false);
	});

	test('maps statuses', () => {
		expect(mapStripeSubscriptionStatus('active')).toBe(SubscriptionStatus.active);
		expect(mapStripeSubscriptionStatus('past_due')).toBe(SubscriptionStatus.active);
		expect(mapStripeSubscriptionStatus('canceled')).toBe(SubscriptionStatus.ended);
		expect(mapStripeSubscriptionStatus('incomplete')).toBeNull();
	});

	test('maps intervals and amounts', () => {
		expect(mapStripeRecurringInterval('month', 1)).toBe(DonationInterval.monthly);
		expect(mapStripeRecurringInterval('month', 3)).toBeNull();
		expect(mapStripeRecurringInterval('year', 1)).toBeNull();
		expect(mapStripeRecurringInterval('week', 1)).toBeNull();
		expect(mapStripePriceAmount(1200)).toBe(12);
		expect(mapStripePriceAmount(null)).toBeNull();
	});

	test('keeps cancel_at_period_end subscriptions active until Stripe cancels them', () => {
		expect(
			mapStripeSubscriptionLifecycle({
				status: 'active',
				canceled_at: null,
			}),
		).toEqual({
			status: SubscriptionStatus.active,
			canceledAt: null,
		});
	});

	test('resolveStripeSubscriptionCanceledAt prefers canceled_at', () => {
		expect(resolveStripeSubscriptionCanceledAt({ canceled_at: 1_700_200_000 })).toEqual(new Date(1_700_200_000 * 1000));
	});

	test('maps canceled without price items', () => {
		expect(
			mapStripeSubscriptionLifecycle({
				status: 'canceled',
				canceled_at: 1_700_000_000,
			}),
		).toEqual({
			status: SubscriptionStatus.ended,
			canceledAt: new Date(1_700_000_000 * 1000),
		});
	});

	test('returns null for incomplete lifecycle', () => {
		expect(mapStripeSubscriptionLifecycle({ status: 'incomplete', canceled_at: null })).toBeNull();
	});

	test('returns null when price is missing', () => {
		expect(mapStripeSubscriptionPriceFields({ items: { data: [] } })).toBeNull();
	});

	test('maps a complete subscription', () => {
		const mapped = mapStripeSubscriptionFields({
			status: 'active',
			canceled_at: null,
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
		});

		expect(mapped).toEqual({
			amount: 50,
			currency: 'CHF',
			interval: DonationInterval.monthly,
			status: SubscriptionStatus.active,
			canceledAt: null,
		});
	});

	test('returns null for incomplete subscription fields', () => {
		expect(
			mapStripeSubscriptionFields({
				status: 'incomplete',
				canceled_at: null,
				items: { data: [] },
			}),
		).toBeNull();
	});

	test('returns null when status maps but price is missing', () => {
		expect(
			mapStripeSubscriptionFields({
				status: 'canceled',
				canceled_at: 1_700_000_000,
				items: { data: [] },
			}),
		).toBeNull();
	});
});
