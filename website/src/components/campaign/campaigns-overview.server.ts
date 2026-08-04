import type { CampaignStory } from '@/components/storyblok/campaign/campaign.types';
import {
	getCampaignPortalSlug,
	getCampaignStoryblokSlug,
	getCampaignTitle,
} from '@/components/storyblok/campaign/campaign.utils';
import type {
	PublicCampaignCard,
	PublicCampaignStatsMap,
	PublicCampaignsWithStats,
} from '@/lib/services/campaign/campaign.types';
import type { AnySearchParams } from '@/lib/types/page-props';
import {
	DEFAULT_CAMPAIGN_STATE,
	isCampaignStateFilter,
	STATE_QUERY_KEY,
	type CampaignStateFilter,
} from './campaigns-overview-query';

const getQueryValue = (searchParams: AnySearchParams | undefined, key: string) => {
	const value = searchParams?.[key];
	const firstValue = Array.isArray(value) ? value.at(0) : value;

	return typeof firstValue === 'string' ? firstValue.trim() : '';
};

export const getStateQuery = (searchParams?: AnySearchParams): CampaignStateFilter => {
	const value = getQueryValue(searchParams, STATE_QUERY_KEY);

	return isCampaignStateFilter(value) ? value : DEFAULT_CAMPAIGN_STATE;
};

export const resolveCampaignsWithCmsEntries = (
	stories: CampaignStory[],
	databaseCampaigns: PublicCampaignCard[],
	statsById: PublicCampaignStatsMap,
): PublicCampaignsWithStats => {
	const databaseCampaignByPortalSlug = new Map(databaseCampaigns.map((campaign) => [campaign.slug, campaign] as const));

	const campaigns: PublicCampaignCard[] = [];

	for (const story of stories) {
		const portalSlug = getCampaignPortalSlug(story.content);
		if (!portalSlug) {
			continue;
		}

		const databaseCampaign = databaseCampaignByPortalSlug.get(portalSlug);
		if (!databaseCampaign) {
			continue;
		}

		campaigns.push({
			...databaseCampaign,
			title: getCampaignTitle(story.content),
			slug: getCampaignStoryblokSlug(story),
		});
	}

	const campaignIds = new Set(campaigns.map((campaign) => campaign.id));
	const filteredStatsById = Object.fromEntries(
		Object.entries(statsById).filter(([campaignId]) => campaignIds.has(campaignId)),
	);

	return {
		campaigns,
		statsById: filteredStatsById,
	};
};
