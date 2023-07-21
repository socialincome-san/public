import { firestoreAdmin } from '@/firebase/admin';
import { ContributionStatsCalculator } from '@socialincome/shared/src/utils/stats/ContributionStatsCalculator';
import { PaymentStatsCalculator } from '@socialincome/shared/src/utils/stats/PaymentStatsCalculator';
import { cache } from 'react';
import 'server-only';

export const getStats = cache(async (currency: string) => {
	console.log('retrieving stats');
	const contributionCalculator = await ContributionStatsCalculator.build(firestoreAdmin, currency);
	const contributionStats = contributionCalculator.allStats();
	const paymentCalculator = await PaymentStatsCalculator.build(firestoreAdmin, currency);
	const paymentStats = paymentCalculator.allStats();
	console.log('retrieved stats');
	return { contributionStats, paymentStats };
});
