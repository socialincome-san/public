import { LocalPartnerDetail } from '@/components/storyblok/local-partner/local-partner-detail';
import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getLocalPartnerDashboardStatsAction } from '@/modules/local-partners/local-partner.actions';
import { getStoryWithFallbackAction } from '@/modules/storyblok-content/storyblok-content.actions';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewLocalPartnerPage = async ({
	storyPath,
	lang,
	region,
	previewRoutePath,
	searchParams,
}: Props) => {
	return await StoryblokPreviewStory<LocalPartnerStory>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (path, language) => {
			const storyResult = await getStoryWithFallbackAction<LocalPartnerStory>({ storyPath: path, language });

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: async (story) => {
			const statsResult = await getLocalPartnerDashboardStatsAction(story.content.portalSlug);
			const { recipientsCount, completedSurveysCount } = statsResult.success
				? statsResult.data
				: { recipientsCount: 0, completedSurveysCount: 0 };

			return (
				<LocalPartnerDetail
					localPartner={story}
					lang={lang}
					region={region}
					recipientsCount={recipientsCount}
					completedSurveysCount={completedSurveysCount}
				/>
			);
		},
	});
};
