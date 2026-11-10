import { resolveCampaignsWithCmsEntries } from '@/components/campaign/campaigns-overview.server';
import type { CampaignStory } from '@/components/storyblok/campaign/campaign.types';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { getAllCampaignsForCmsJoinWithStatsAction } from '@/modules/campaigns/campaign.actions';
import type { PublicCampaignsWithStats } from '@/modules/campaigns/campaign.types';
import { getCampaignsAction } from '@/modules/storyblok-content/storyblok-content.actions';

const TEASER_LIMIT = 3;

export const getTeaserCampaigns = async (lang: WebsiteLanguage, excludeSlug?: string): Promise<PublicCampaignsWithStats> => {
	const [campaignStoriesResult, campaignsResult] = await Promise.all([
		getCampaignsAction(lang),
		getAllCampaignsForCmsJoinWithStatsAction('active'),
	]);

	const campaignStories = (campaignStoriesResult.success ? campaignStoriesResult.data : []) as CampaignStory[];
	const campaignsData = campaignsResult.success ? campaignsResult.data : { campaigns: [], statsById: {} };
	const resolved = resolveCampaignsWithCmsEntries(campaignStories, campaignsData.campaigns, campaignsData.statsById);
	const campaigns = resolved.campaigns.filter((campaign) => campaign.slug !== excludeSlug).slice(0, TEASER_LIMIT);

	const campaignIds = new Set(campaigns.map((campaign) => campaign.id));
	const statsById = Object.fromEntries(
		Object.entries(resolved.statsById).filter(([campaignId]) => campaignIds.has(campaignId)),
	);

	return { campaigns, statsById };
};
