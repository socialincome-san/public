import { SubscriptionStatus } from '@/generated/prisma/enums';

const STANDING_ORDER_REF_PATTERN = /^(\d{10})(?:-\d+)?$/;

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

/** Prefer a 10-digit ref that appears at least twice; otherwise the contributor payment reference. */
export const preferredStandingOrderReference = (input: {
	transactionIds: readonly string[];
	paymentReferenceId: string | null;
	contributorId: string;
	amount: number;
	currency: string;
}): string => {
	const extracted = input.transactionIds
		.map(extractStandingOrderReference)
		.filter((reference): reference is string => reference !== null);

	if (extracted.length >= 2) {
		const preferred = modeValue(extracted);
		const preferredCount = extracted.filter((reference) => reference === preferred).length;
		if (preferredCount >= 2) {
			return preferred;
		}
	}

	if (input.paymentReferenceId) {
		return input.paymentReferenceId;
	}

	return `${input.contributorId}-${input.amount}-${input.currency}`;
};

export const disambiguateStandingOrderReference = (reference: string, contributorId: string, amount: number): string =>
	`${reference}-${contributorId}-${amount}`;

export const uniquifyStandingOrderReferences = (
	groups: readonly { reference: string; contributorId: string; amount: number }[],
): string[] => {
	const counts = new Map<string, number>();
	for (const { reference } of groups) {
		counts.set(reference, (counts.get(reference) ?? 0) + 1);
	}

	return groups.map(({ reference, contributorId, amount }) =>
		(counts.get(reference) ?? 0) > 1 ? disambiguateStandingOrderReference(reference, contributorId, amount) : reference,
	);
};
