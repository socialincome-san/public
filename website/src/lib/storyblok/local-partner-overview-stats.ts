import { getPublicLocalPartnerOverviewStatsBySlugs } from '@/modules/local-partners/local-partner.service';
import type { PublicLocalPartnerOverviewStatsMap } from '@/modules/local-partners/local-partner.types';

// Snapshot of public production recipient totals plus candidate placeholders for local design previews.
const developmentOverviewStatsByPortalSlug: PublicLocalPartnerOverviewStatsMap = {
	'the-ark-foundation': { recipientsCount: 0, candidatesCount: 35 },
	'rev-dr-karla-j-cooper-foundation': { recipientsCount: 20, candidatesCount: 18 },
	ephraim: { recipientsCount: 20, candidatesCount: 12 },
	'reunion-freetown': { recipientsCount: 11, candidatesCount: 9 },
	'we-yone-child-foundation': { recipientsCount: 65, candidatesCount: 24 },
	'united-polio-brothers-and-sisters': { recipientsCount: 29, candidatesCount: 16 },
	'rainbo-initiative': { recipientsCount: 46, candidatesCount: 21 },
	'lizard-earth': { recipientsCount: 100, candidatesCount: 14 },
	'help-a-mother-and-newborn-initiative': { recipientsCount: 29, candidatesCount: 11 },
	'one-village-partners': { recipientsCount: 39, candidatesCount: 19 },
	'freetown-city-council': { recipientsCount: 15, candidatesCount: 8 },
	'equal-rights-alliance': { recipientsCount: 29, candidatesCount: 17 },
	'reachout-salone': { recipientsCount: 36, candidatesCount: 13 },
	'jamil-nyanga-jaward': { recipientsCount: 35, candidatesCount: 15 },
	'aurora-foundation': { recipientsCount: 42, candidatesCount: 10 },
	'sierra-leone-association-of-ebola-survivors': { recipientsCount: 62, candidatesCount: 22 },
};

export const getLocalPartnerOverviewStats = async (portalSlugs: string[]): Promise<PublicLocalPartnerOverviewStatsMap> => {
	const statsResult = await getPublicLocalPartnerOverviewStatsBySlugs(portalSlugs);
	const statsByPortalSlug = statsResult.success ? statsResult.data : {};

	if (process.env.NODE_ENV !== 'development') {
		return statsByPortalSlug;
	}

	return Object.fromEntries(
		[...new Set(portalSlugs)].map((portalSlug) => {
			const stats = statsByPortalSlug[portalSlug];
			const developmentStats = developmentOverviewStatsByPortalSlug[portalSlug];

			return [
				portalSlug,
				{
					recipientsCount: stats?.recipientsCount ?? developmentStats?.recipientsCount ?? 0,
					candidatesCount: stats?.candidatesCount ?? developmentStats?.candidatesCount ?? 0,
				},
			];
		}),
	);
};
