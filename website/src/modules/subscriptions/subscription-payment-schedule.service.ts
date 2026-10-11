import type { UpcomingPaymentView } from './subscription.types';

const startOfUtcDay = (date: Date): Date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const dateAtAnchorDay = (reference: Date, anchorDay: number, monthOffset: number): Date => {
	const year = reference.getUTCFullYear();
	const month = reference.getUTCMonth() + monthOffset;
	const lastDayOfTargetMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

	return new Date(Date.UTC(year, month, Math.min(anchorDay, lastDayOfTargetMonth)));
};

export const subscriptionPaymentSchedule = {
	buildMonthly: ({ anchor, count, now: referenceNow }: { anchor: Date; count: number; now: Date }): Date[] => {
		const anchorDay = anchor.getUTCDate();
		const today = startOfUtcDay(referenceNow);
		let monthOffset = 0;
		let first = dateAtAnchorDay(anchor, anchorDay, monthOffset);

		while (first.getTime() < today.getTime()) {
			monthOffset += 1;
			first = dateAtAnchorDay(anchor, anchorDay, monthOffset);
		}

		return Array.from({ length: count }, (_, index) => dateAtAnchorDay(anchor, anchorDay, monthOffset + index));
	},
	mergeUpcoming: (payments: UpcomingPaymentView[]): UpcomingPaymentView[] =>
		[...payments].sort((left, right) => {
			const dateDiff = left.scheduledAt.getTime() - right.scheduledAt.getTime();

			return dateDiff !== 0 ? dateDiff : left.subscriptionId.localeCompare(right.subscriptionId);
		}),
};
