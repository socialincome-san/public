import { CampaignDetail } from '@/components/campaign/campaign-detail';
import { type CampaignStory } from '@/components/storyblok/campaign/load-campaign-detail-data';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { type WebsiteLanguage, type WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { notFound } from 'next/navigation';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewCampaignPage = async ({ storyPath, lang, region, previewRoutePath, searchParams }: Props) => {
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
			const portalSlug = story.content.portalSlug?.trim();
			if (!portalSlug) {
				return notFound();
			}

			const campaignResult = await services.read.campaign.getByPortalSlug(portalSlug);
			if (!campaignResult.success || !campaignResult.data) {
				return notFound();
			}

			return (
				<CampaignDetail
					campaign={campaignResult.data}
					title={story.content.title}
					description={story.content.description}
					campaignSlug={portalSlug}
					lang={lang}
					region={region}
				/>
			);
		},
	});
};
