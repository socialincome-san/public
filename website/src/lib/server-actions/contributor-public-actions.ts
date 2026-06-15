'use server';

import { services } from '@/lib/services/services';

export const getContributorCommunityStatsAction = async () => {
	return services.read.contributor.getCommunityStats();
};
