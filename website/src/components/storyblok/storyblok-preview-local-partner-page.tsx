import { LocalPartnerDetail } from '@/components/storyblok/local-partner/local-partner-detail';
import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

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
			const storyResult = await services.storyblok.getStoryWithFallback<LocalPartnerStory>(path, language);

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: async (story) => {
			const localPartnerSlug = story.content.portalSlug?.trim();
			const dashboardStatsResult = localPartnerSlug
				? await services.read.localPartner.getPublicLocalPartnerDashboardStatsBySlug(localPartnerSlug)
				: undefined;

			return (
				<LocalPartnerDetail
					localPartner={story}
					lang={lang}
					region={region}
					recipientsCount={dashboardStatsResult?.success ? dashboardStatsResult.data.recipientsCount : undefined}
					completedSurveysCount={dashboardStatsResult?.success ? dashboardStatsResult.data.completedSurveysCount : undefined}
				/>
			);
		},
	});
};
