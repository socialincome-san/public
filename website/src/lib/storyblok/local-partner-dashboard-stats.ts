import { services } from '@/lib/services/services';

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

	const statsResult = await services.read.localPartner.getPublicLocalPartnerDashboardStatsBySlug(normalizedSlug);

	return statsResult.success ? statsResult.data : emptyStats;
};
