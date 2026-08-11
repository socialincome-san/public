import { DonationInterval, SubscriptionStatus } from '@/generated/prisma/enums';
import {
	getStripeKeyMode,
	mapStripePriceAmount,
	mapStripeRecurringInterval,
	mapStripeSubscriptionStatus,
	mapWithConcurrency,
	parseBackfillCliOptions,
	resolveStripeCustomerId,
	shouldSkipStripeSubscriptionStatus,
} from './backfill-stripe-subscriptions.mappers';

describe('backfill-stripe-subscriptions.mappers', () => {
	describe('parseBackfillCliOptions', () => {
		test('defaults to dry-run without limit', () => {
			expect(parseBackfillCliOptions([])).toEqual({
				apply: false,
				limit: null,
				concurrency: 2,
			});
		});

		test('parses --apply, --limit and --concurrency', () => {
			expect(parseBackfillCliOptions(['--apply', '--limit=10', '--concurrency=4'])).toEqual({
				apply: true,
				limit: 10,
				concurrency: 4,
			});
		});

		test('rejects invalid --limit and --concurrency', () => {
			expect(() => parseBackfillCliOptions(['--limit=0'])).toThrow('Invalid --limit value');
			expect(() => parseBackfillCliOptions(['--concurrency=-1'])).toThrow('Invalid --concurrency value');
		});
	});

	describe('shouldSkipStripeSubscriptionStatus', () => {
		test('skips incomplete statuses', () => {
			expect(shouldSkipStripeSubscriptionStatus('incomplete')).toBe(true);
			expect(shouldSkipStripeSubscriptionStatus('incomplete_expired')).toBe(true);
			expect(shouldSkipStripeSubscriptionStatus('active')).toBe(false);
		});
	});

	describe('mapStripeSubscriptionStatus', () => {
		test('maps live statuses to active', () => {
			expect(mapStripeSubscriptionStatus('active', null)).toBe(SubscriptionStatus.active);
			expect(mapStripeSubscriptionStatus('trialing', null)).toBe(SubscriptionStatus.active);
			expect(mapStripeSubscriptionStatus('past_due', null)).toBe(SubscriptionStatus.active);
			expect(mapStripeSubscriptionStatus('unpaid', null)).toBe(SubscriptionStatus.active);
			expect(mapStripeSubscriptionStatus('paused', null)).toBe(SubscriptionStatus.active);
		});

		test('maps canceled and ended', () => {
			expect(mapStripeSubscriptionStatus('canceled', null)).toBe(SubscriptionStatus.canceled);
			expect(mapStripeSubscriptionStatus('canceled', 1_700_000_000)).toBe(SubscriptionStatus.ended);
		});

		test('returns null for incomplete and unknown', () => {
			expect(mapStripeSubscriptionStatus('incomplete', null)).toBeNull();
			expect(mapStripeSubscriptionStatus('weird', null)).toBeNull();
		});
	});

	describe('mapStripeRecurringInterval', () => {
		test('maps supported intervals', () => {
			expect(mapStripeRecurringInterval('month', 1)).toBe(DonationInterval.monthly);
			expect(mapStripeRecurringInterval('month', 3)).toBe(DonationInterval.quarterly);
			expect(mapStripeRecurringInterval('month', 12)).toBe(DonationInterval.yearly);
			expect(mapStripeRecurringInterval('year', 1)).toBe(DonationInterval.yearly);
		});

		test('returns null for unsupported intervals', () => {
			expect(mapStripeRecurringInterval('week', 1)).toBeNull();
			expect(mapStripeRecurringInterval('month', 2)).toBeNull();
		});
	});

	describe('mapStripePriceAmount', () => {
		test('converts cents to major units', () => {
			expect(mapStripePriceAmount(1200)).toBe(12);
			expect(mapStripePriceAmount(0)).toBe(0);
			expect(mapStripePriceAmount(null)).toBeNull();
		});
	});

	describe('id resolvers', () => {
		test('resolveStripeCustomerId', () => {
			expect(resolveStripeCustomerId('cus_123')).toBe('cus_123');
			expect(resolveStripeCustomerId({ id: 'cus_456' })).toBe('cus_456');
			expect(resolveStripeCustomerId(null)).toBeNull();
		});
	});

	describe('banner helpers', () => {
		test('getStripeKeyMode', () => {
			expect(getStripeKeyMode('sk_live_abc')).toBe('live');
			expect(getStripeKeyMode('sk_test_abc')).toBe('test');
			expect(getStripeKeyMode('rk_live_abc')).toBe('unknown');
		});
	});

	describe('mapWithConcurrency', () => {
		test('processes every item once at concurrency 1 and 3', async () => {
			for (const concurrency of [1, 3]) {
				const seen: number[] = [];
				await mapWithConcurrency([1, 2, 3, 4, 5], concurrency, (item) => {
					seen.push(item);

					return Promise.resolve();
				});
				expect(seen.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
			}
		});
	});
});
