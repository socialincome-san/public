import {
	buildMonthlySchedule,
	mergeUpcomingPayments,
	UPCOMING_PAYMENTS_PER_SUBSCRIPTION,
} from './subscription-payment-schedule';
import { type UpcomingPaymentView } from './subscription.types';

const createPayment = ({
	subscriptionId,
	scheduledAt,
}: {
	subscriptionId: string;
	scheduledAt: Date;
}): UpcomingPaymentView => ({
	subscriptionId,
	scheduledAt,
	amount: 30,
	currency: 'CHF',
	paymentDisplay: { type: 'stripe', brand: 'Visa', last4: '4242' },
	status: 'scheduled',
});

describe('buildMonthlySchedule', () => {
	it('returns count dates starting from anchor when anchor is today', () => {
		const now = new Date('2026-03-05T12:00:00.000Z');
		const anchor = new Date('2026-03-05T00:00:00.000Z');

		const dates = buildMonthlySchedule({ anchor, count: UPCOMING_PAYMENTS_PER_SUBSCRIPTION, now });

		expect(dates).toHaveLength(UPCOMING_PAYMENTS_PER_SUBSCRIPTION);
		expect(dates[0]?.toISOString()).toBe('2026-03-05T00:00:00.000Z');
		expect(dates[1]?.toISOString()).toBe('2026-04-05T00:00:00.000Z');
		expect(dates[2]?.toISOString()).toBe('2026-05-05T00:00:00.000Z');
		expect(dates[3]?.toISOString()).toBe('2026-06-05T00:00:00.000Z');
	});

	it('skips past anchor dates and returns the next occurrences', () => {
		const now = new Date('2026-01-15T12:00:00.000Z');
		const anchor = new Date('2024-11-01T00:00:00.000Z');

		const dates = buildMonthlySchedule({ anchor, count: UPCOMING_PAYMENTS_PER_SUBSCRIPTION, now });

		expect(dates[0]?.toISOString()).toBe('2026-02-01T00:00:00.000Z');
		expect(dates[1]?.toISOString()).toBe('2026-03-01T00:00:00.000Z');
		expect(dates[2]?.toISOString()).toBe('2026-04-01T00:00:00.000Z');
		expect(dates[3]?.toISOString()).toBe('2026-05-01T00:00:00.000Z');
	});

	it('clamps month-end anchors when advancing months', () => {
		const now = new Date('2026-01-15T12:00:00.000Z');
		const anchor = new Date('2025-01-31T00:00:00.000Z');

		const dates = buildMonthlySchedule({ anchor, count: 3, now });

		expect(dates[0]?.toISOString()).toBe('2026-01-31T00:00:00.000Z');
		expect(dates[1]?.toISOString()).toBe('2026-02-28T00:00:00.000Z');
		expect(dates[2]?.toISOString()).toBe('2026-03-31T00:00:00.000Z');
	});
});

describe('mergeUpcomingPayments', () => {
	it('sorts by scheduled date ascending and tie-breaks by subscription id', () => {
		const payments = [
			createPayment({ subscriptionId: 'sub-b', scheduledAt: new Date('2026-04-07T00:00:00.000Z') }),
			createPayment({ subscriptionId: 'sub-a', scheduledAt: new Date('2026-03-05T00:00:00.000Z') }),
			createPayment({ subscriptionId: 'sub-b', scheduledAt: new Date('2026-03-07T00:00:00.000Z') }),
		];

		const merged = mergeUpcomingPayments(payments);

		expect(merged.map((payment) => `${payment.subscriptionId}:${payment.scheduledAt.toISOString()}`)).toEqual([
			'sub-a:2026-03-05T00:00:00.000Z',
			'sub-b:2026-03-07T00:00:00.000Z',
			'sub-b:2026-04-07T00:00:00.000Z',
		]);
	});
});
