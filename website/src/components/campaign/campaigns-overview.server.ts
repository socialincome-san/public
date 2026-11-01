import type { CampaignStory } from '@/components/storyblok/campaign/campaign.types';
import {
	getCampaignPortalSlug,
	getCampaignStoryblokSlug,
	getCampaignTitle,
} from '@/components/storyblok/campaign/campaign.utils';
import type {
	CampaignCmsJoin,
	PublicCampaignCard,
	PublicCampaignStatsMap,
	PublicCampaignsWithStats,
} from '@/modules/campaigns/campaign.types';

export const campaignMatchesSearchQuery = (campaign: PublicCampaignCard, searchQuery: string) => {
	const keywords = [campaign.title, campaign.creatorName ?? ''].join(' ').toLowerCase();
	const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

	return searchTerms.length > 0 && searchTerms.every((term) => keywords.includes(term));
};

export const resolveCampaignsWithCmsEntries = (
	stories: CampaignStory[],
	databaseCampaigns: CampaignCmsJoin[],
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

		const primaryImageFilename = story.content.primaryImage?.filename?.trim();

		campaigns.push({
			...databaseCampaign,
			title: getCampaignTitle(story.content),
			creatorName: story.content.creatorName,
			slug: getCampaignStoryblokSlug(story),
			primaryImage: primaryImageFilename
				? {
						filename: primaryImageFilename,
						alt: story.content.primaryImage.alt,
						focus: story.content.primaryImage.focus,
					}
				: null,
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
