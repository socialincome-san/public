import type { PayoutInterval } from '@/generated/prisma/enums';

export const calculateTotalBudget = (
	recipients: number,
	durationMonths: number,
	payoutPerInterval: number,
	interval: PayoutInterval,
): number => {
	let numberOfIntervals: number;

	if (interval === 'monthly') {
		numberOfIntervals = durationMonths;
	} else if (interval === 'quarterly') {
		numberOfIntervals = Math.ceil(durationMonths / 3);
	} else {
		numberOfIntervals = Math.ceil(durationMonths / 12);
	}

	const totalBudget = recipients * payoutPerInterval * numberOfIntervals;
	return totalBudget;
}

export const calculateMonthlyCost = (recipients: number, payoutPerInterval: number, interval: PayoutInterval): number => {
	let monthlyCost: number;

	if (interval === 'monthly') {
		monthlyCost = recipients * payoutPerInterval;
	} else if (interval === 'quarterly') {
		monthlyCost = (recipients * payoutPerInterval) / 3;
	} else {
		monthlyCost = (recipients * payoutPerInterval) / 12;
	}

	return monthlyCost;
}
