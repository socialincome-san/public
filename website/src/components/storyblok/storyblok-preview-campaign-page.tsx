import { CampaignDetail } from '@/components/storyblok/campaign/campaign-detail';
import type { CampaignStory } from '@/components/storyblok/campaign/campaign.types';
import { getCampaignId } from '@/components/storyblok/campaign/campaign.utils';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

const getCampaignStats = async (campaignId: string) => {
	const statsResult = await services.read.campaign.getPublicCampaignStatsById(campaignId);

	return statsResult.success ? statsResult.data : undefined;
};

export const StoryblokPreviewCampaignPage = async ({ storyPath, lang, previewRoutePath, searchParams }: Props) => {
	return await StoryblokPreviewStory<CampaignStory>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (path, language) => {
			const storyResult = await services.storyblok.getStoryWithFallback<CampaignStory>(path, language);

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: async (story) => {
			const campaignId = getCampaignId(story.content);
			const stats = campaignId ? await getCampaignStats(campaignId) : undefined;

			return (
				<CampaignDetail
					campaign={story}
					lang={lang}
					contributionsCount={stats?.contributionsCount}
					daysLeft={stats?.daysLeft}
				/>
			);
		},
	});
};
