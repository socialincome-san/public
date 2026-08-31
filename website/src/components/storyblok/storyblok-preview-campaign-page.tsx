import { CampaignDetail } from '@/components/campaign/campaign-detail';
import type { CampaignStory } from '@/components/storyblok/campaign/campaign.types';
import { getCampaignPortalSlug, getCampaignTitle } from '@/components/storyblok/campaign/campaign.utils';
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
			const portalSlug = getCampaignPortalSlug(story.content);
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
					title={getCampaignTitle(story.content)}
					description={story.content.description}
					creatorName={story.content.creatorName}
					quote={story.content.quote ?? ''}
					primaryImage={story.content.primaryImage}
					profilePicture={story.content.profilePicture}
					sectionDescription={story.content.sectionDescription}
					sectionImage={story.content.sectionImage}
					instagramHandle={story.content.instagramHandle}
					xHandle={story.content.xHandle}
					tiktokHandle={story.content.tiktokHandle}
					linkWebsite={story.content.linkWebsite}
					campaignSlug={story.slug}
					lang={lang}
					region={region}
				/>
			);
		},
	});
};
