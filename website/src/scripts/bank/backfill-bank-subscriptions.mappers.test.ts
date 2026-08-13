import { SubscriptionStatus } from '@/generated/prisma/enums';
import {
	daysBetween,
	extractStandingOrderReference,
	inferSubscriptionStatus,
	looksLikeMonthlyStandingOrder,
	median,
	modeAmount,
	modeValue,
	parseBankBackfillCliOptions,
} from './backfill-bank-subscriptions.mappers';

describe('backfill-bank-subscriptions.mappers', () => {
	describe('parseBankBackfillCliOptions', () => {
		test('defaults to dry-run without limit', () => {
			expect(parseBankBackfillCliOptions([])).toEqual({ apply: false, limit: null });
		});

		test('parses --apply and --limit', () => {
			expect(parseBankBackfillCliOptions(['--apply', '--limit=5'])).toEqual({
				apply: true,
				limit: 5,
			});
		});

		test('rejects invalid --limit', () => {
			expect(() => parseBankBackfillCliOptions(['--limit=0'])).toThrow('Invalid --limit value');
		});
	});

	describe('extractStandingOrderReference', () => {
		test('extracts bare contribution reference', () => {
			expect(extractStandingOrderReference('1733400000')).toBe('1733400000');
		});

		test('extracts reference from renewal suffix', () => {
			expect(extractStandingOrderReference('1733400000-1734000000123')).toBe('1733400000');
		});

		test('returns null for legacy/synthetic ids', () => {
			expect(extractStandingOrderReference('1734000000123-legacy')).toBeNull();
			expect(extractStandingOrderReference('txn-seed-gh-onetime-1')).toBeNull();
			expect(extractStandingOrderReference('123456789')).toBeNull();
			expect(extractStandingOrderReference('12345678901')).toBeNull();
			expect(extractStandingOrderReference('')).toBeNull();
			expect(extractStandingOrderReference('legacy_wire-transfer_abc')).toBeNull();
		});
	});

	describe('looksLikeMonthlyStandingOrder', () => {
		test('detects monthly gaps including boundaries', () => {
			expect(looksLikeMonthlyStandingOrder([28, 31, 30])).toBe(true);
			expect(looksLikeMonthlyStandingOrder([20])).toBe(true);
			expect(looksLikeMonthlyStandingOrder([45])).toBe(true);
		});

		test('rejects non-monthly gaps', () => {
			expect(looksLikeMonthlyStandingOrder([90, 92])).toBe(false);
			expect(looksLikeMonthlyStandingOrder([5, 7])).toBe(false);
			expect(looksLikeMonthlyStandingOrder([19.9])).toBe(false);
			expect(looksLikeMonthlyStandingOrder([45.1])).toBe(false);
			expect(looksLikeMonthlyStandingOrder([])).toBe(false);
		});
	});

	describe('inferSubscriptionStatus', () => {
		const now = new Date('2025-06-01T00:00:00.000Z');

		test('active when recent', () => {
			expect(inferSubscriptionStatus(new Date('2025-05-15T00:00:00.000Z'), now)).toBe(SubscriptionStatus.active);
		});

		test('canceled when a few months stale', () => {
			expect(inferSubscriptionStatus(new Date('2025-03-01T00:00:00.000Z'), now)).toBe(SubscriptionStatus.canceled);
		});

		test('ended when long stale', () => {
			expect(inferSubscriptionStatus(new Date('2024-01-01T00:00:00.000Z'), now)).toBe(SubscriptionStatus.ended);
		});
	});

	describe('helpers', () => {
		test('daysBetween and median', () => {
			expect(daysBetween(new Date('2025-01-01'), new Date('2025-01-31'))).toBe(30);
			expect(median([1, 3, 2])).toBe(2);
			expect(median([1, 2, 3, 4])).toBe(2.5);
		});

		test('modeValue prefers later on ties', () => {
			expect(modeValue(['a', 'b', 'a', 'b'])).toBe('b');
			expect(modeValue(['camp-1', 'camp-2', 'camp-1'])).toBe('camp-1');
			expect(() => modeValue([])).toThrow('modeValue requires at least one value');
		});

		test('modeAmount', () => {
			expect(modeAmount([50, 50, 80])).toBe(50);
			expect(() => modeAmount([])).toThrow('modeValue requires at least one value');
		});
	});
});
