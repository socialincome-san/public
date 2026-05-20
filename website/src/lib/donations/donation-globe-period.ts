import { now } from '@/lib/utils/now';
import { subYears } from 'date-fns';

export const getDonationGlobePeriod = () => {
	const periodEnd = now();
	const periodStart = subYears(periodEnd, 1);

	return { periodStart, periodEnd };
};
