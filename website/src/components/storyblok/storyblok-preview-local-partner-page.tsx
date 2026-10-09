import { LocalPartnerDetail } from '@/components/storyblok/local-partner/local-partner-detail';
import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getCommunityPanelDataAction } from '@/modules/community/community.actions';
import { getLocalPartnerDashboardStatsAction } from '@/modules/local-partners/local-partner.actions';
import { getStoryWithFallbackAction } from '@/modules/storyblok-content/storyblok-content.actions';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewLocalPartnerPage = async ({
	storyPath,
	lang,
	currency,
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
			const [statsResult, communityResult] = await Promise.all([
				getLocalPartnerDashboardStatsAction(story.content.portalSlug),
				getCommunityPanelDataAction({ page: story.content, language: lang, currency }),
			]);
			const { recipientsCount, completedSurveysCount } = statsResult.success
				? statsResult.data
				: { recipientsCount: 0, completedSurveysCount: 0 };

			return (
				<LocalPartnerDetail
					localPartner={story}
					lang={lang}
					currency={currency}
					recipientsCount={recipientsCount}
					completedSurveysCount={completedSurveysCount}
					community={communityResult.success ? communityResult.data : null}
				/>
			);
		},
	});
};
