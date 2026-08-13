import { DonationInterval, SubscriptionStatus } from '@/generated/prisma/enums';
import { parsePositiveIntFlag, resolveStripeResourceId } from '../shared/backfill-shared';

export type BackfillCliOptions = {
	apply: boolean;
	limit: number | null;
	concurrency: number;
};

const DEFAULT_CONCURRENCY = 2;

export const parseBackfillCliOptions = (argv: string[]): BackfillCliOptions => {
	const limit = parsePositiveIntFlag(argv, '--limit');
	const concurrency = parsePositiveIntFlag(argv, '--concurrency') ?? DEFAULT_CONCURRENCY;

	return {
		apply: argv.includes('--apply'),
		limit,
		concurrency,
	};
};

export const shouldSkipStripeSubscriptionStatus = (status: string): boolean =>
	status === 'incomplete' || status === 'incomplete_expired';

export const mapStripeSubscriptionStatus = (status: string, endedAt: number | null): SubscriptionStatus | null => {
	if (shouldSkipStripeSubscriptionStatus(status)) {
		return null;
	}

	if (status === 'canceled') {
		return endedAt ? SubscriptionStatus.ended : SubscriptionStatus.canceled;
	}

	if (status === 'active' || status === 'trialing' || status === 'past_due' || status === 'unpaid' || status === 'paused') {
		return SubscriptionStatus.active;
	}

	return null;
};

export const mapStripeRecurringInterval = (interval: string, intervalCount: number): DonationInterval | null => {
	if (interval === 'month' && intervalCount === 1) {
		return DonationInterval.monthly;
	}

	return null;
};

export const mapStripePriceAmount = (unitAmount: number | null): number | null => {
	if (unitAmount === null || unitAmount < 0) {
		return null;
	}

	return unitAmount / 100;
};

export const resolveStripeCustomerId = resolveStripeResourceId;

export const getStripeKeyMode = (secretKey: string): 'live' | 'test' | 'unknown' => {
	if (secretKey.startsWith('sk_live_')) {
		return 'live';
	}
	if (secretKey.startsWith('sk_test_')) {
		return 'test';
	}

	return 'unknown';
};

export const mapWithConcurrency = async <T>(
	items: T[],
	concurrency: number,
	worker: (item: T) => Promise<void>,
): Promise<void> => {
	let nextIndex = 0;

	const runWorker = async () => {
		while (nextIndex < items.length) {
			const currentIndex = nextIndex;
			nextIndex += 1;
			await worker(items[currentIndex]);
		}
	};

	const workers = Array.from({ length: Math.min(concurrency, Math.max(items.length, 1)) }, () => runWorker());
	await Promise.all(workers);
};
