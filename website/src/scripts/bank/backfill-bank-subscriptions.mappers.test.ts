import { SubscriptionStatus } from '@/generated/prisma/enums';
import {
	daysBetween,
	extractStandingOrderReference,
	inferSubscriptionStatus,
	looksLikeMonthlyStandingOrder,
	median,
	modeValue,
	preferredStandingOrderReference,
	uniquifyStandingOrderReferences,
} from './backfill-bank-subscriptions.mappers';

describe('backfill-bank-subscriptions.mappers', () => {
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

		test('uses 50 and 120 day boundaries', () => {
			expect(inferSubscriptionStatus(new Date('2025-04-12T00:00:00.000Z'), now)).toBe(SubscriptionStatus.active);
			expect(inferSubscriptionStatus(new Date('2025-04-11T00:00:00.000Z'), now)).toBe(SubscriptionStatus.canceled);
			expect(inferSubscriptionStatus(new Date('2025-02-01T00:00:00.000Z'), now)).toBe(SubscriptionStatus.canceled);
			expect(inferSubscriptionStatus(new Date('2025-01-31T00:00:00.000Z'), now)).toBe(SubscriptionStatus.ended);
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
			expect(modeValue([50, 50, 80])).toBe(50);
			expect(() => modeValue([])).toThrow('modeValue requires at least one value');
		});
	});

	describe('preferredStandingOrderReference', () => {
		test('uses a 10-digit ref that appears at least twice', () => {
			expect(
				preferredStandingOrderReference({
					transactionIds: ['1766670134', '1766670134-1772233209298', 'abc-legacy'],
					paymentReferenceId: '1766670133790',
					contributorId: 'carole',
					amount: 85,
					currency: 'CHF',
				}),
			).toBe('1766670134');
		});

		test('ignores a single stray 10-digit ref and falls back to paymentReferenceId', () => {
			expect(
				preferredStandingOrderReference({
					transactionIds: ['1766670134-1769814008260', '1772233209327-legacy', '1774994410068-legacy'],
					paymentReferenceId: '1758351328881',
					contributorId: 'joseph',
					amount: 75,
					currency: 'CHF',
				}),
			).toBe('1758351328881');
		});

		test('falls back to contributorId-amount-currency when nothing else is available', () => {
			expect(
				preferredStandingOrderReference({
					transactionIds: ['legacy_wire-transfer_abc'],
					paymentReferenceId: null,
					contributorId: 'c1',
					amount: 50,
					currency: 'CHF',
				}),
			).toBe('c1-50-CHF');
		});
	});

	describe('uniquifyStandingOrderReferences', () => {
		test('suffixes colliding refs from the same contributor with two amounts', () => {
			expect(
				uniquifyStandingOrderReferences([
					{ reference: '1749133425971', contributorId: 'lorenz', amount: 60 },
					{ reference: '1749133425971', contributorId: 'lorenz', amount: 40 },
				]),
			).toEqual(['1749133425971-lorenz-60', '1749133425971-lorenz-40']);
		});

		test('leaves unique refs unchanged', () => {
			expect(
				uniquifyStandingOrderReferences([
					{ reference: '1766670134', contributorId: 'carole', amount: 85 },
					{ reference: '1758351328881', contributorId: 'joseph', amount: 75 },
				]),
			).toEqual(['1766670134', '1758351328881']);
		});
	});
});
