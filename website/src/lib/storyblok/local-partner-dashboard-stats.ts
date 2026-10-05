import { getPublicLocalPartnerDashboardStatsBySlug } from '@/modules/local-partners/local-partner.service';

type LocalPartnerDashboardStats = {
	recipientsCount: number;
	completedSurveysCount: number;
};

const emptyStats: LocalPartnerDashboardStats = {
	recipientsCount: 0,
	completedSurveysCount: 0,
};

export const getLocalPartnerDashboardStats = async (portalSlug?: string): Promise<LocalPartnerDashboardStats> => {
	const normalizedSlug = portalSlug?.trim();
	if (!normalizedSlug) {
		return emptyStats;
	}

	const statsResult = await getPublicLocalPartnerDashboardStatsBySlug(normalizedSlug);

	return statsResult.success ? statsResult.data : emptyStats;
};
