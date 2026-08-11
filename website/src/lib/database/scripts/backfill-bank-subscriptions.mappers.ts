import { ContributionStatus, SubscriptionStatus } from '@/generated/prisma/enums';
import { parsePositiveIntFlag } from './backfill-shared';

export type BankBackfillCliOptions = {
	apply: boolean;
	confirmApply: boolean;
	limit: number | null;
};

const STANDING_ORDER_REF_PATTERN = /^(\d{10})(?:-\d+)?$/;

export const parseBankBackfillCliOptions = (argv: string[]): BankBackfillCliOptions => ({
	apply: argv.includes('--apply'),
	confirmApply: argv.includes('--confirm-apply'),
	limit: parsePositiveIntFlag(argv, '--limit'),
});

/** `1234567890` or `1234567890-{millis}` → standing-order ref; null for legacy ids. */
export const extractStandingOrderReference = (transactionId: string): string | null => {
	const match = STANDING_ORDER_REF_PATTERN.exec(transactionId);

	return match?.[1] ?? null;
};

export const daysBetween = (earlier: Date, later: Date): number => {
	const ms = later.getTime() - earlier.getTime();

	return ms / (1000 * 60 * 60 * 24);
};

export const median = (values: number[]): number | null => {
	if (values.length === 0) {
		return null;
	}

	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 0) {
		return (sorted[mid - 1] + sorted[mid]) / 2;
	}

	return sorted[mid];
};

/** Median gap roughly one month (~20–45 days). */
export const looksLikeMonthlyStandingOrder = (gapsInDays: number[]): boolean => {
	const medianGap = median(gapsInDays);
	if (medianGap === null) {
		return false;
	}

	return medianGap >= 20 && medianGap <= 45;
};

export const inferSubscriptionStatus = (lastPaymentAt: Date, now = new Date()): SubscriptionStatus => {
	const daysSinceLastPayment = daysBetween(lastPaymentAt, now);

	if (daysSinceLastPayment <= 50) {
		return SubscriptionStatus.active;
	}
	if (daysSinceLastPayment <= 120) {
		return SubscriptionStatus.canceled;
	}

	return SubscriptionStatus.ended;
};

/** Most frequent value; ties prefer the later occurrence (chronological lists → prefer recent). */
export const modeValue = <T>(values: readonly T[]): T => {
	if (values.length === 0) {
		throw new Error('modeValue requires at least one value');
	}

	const counts = new Map<T, number>();
	let bestValue = values[0];
	let bestCount = 0;

	for (const value of values) {
		const count = (counts.get(value) ?? 0) + 1;
		counts.set(value, count);
		if (count >= bestCount) {
			bestValue = value;
			bestCount = count;
		}
	}

	return bestValue;
};

export const modeAmount = (amounts: number[]): number => modeValue(amounts);

export const isLinkableBankContributionStatus = (status: ContributionStatus): boolean =>
	status === ContributionStatus.succeeded || status === ContributionStatus.pending;
