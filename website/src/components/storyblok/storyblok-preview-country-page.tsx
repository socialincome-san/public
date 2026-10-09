import { CountryDetail } from '@/components/storyblok/country/country-detail';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { Country } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getCommunityPanelDataAction } from '@/modules/community/community.actions';
import { getCountryPageStatsAction } from '@/modules/countries/country.actions';
import { getStoryWithFallbackAction } from '@/modules/storyblok-content/storyblok-content.actions';
import type { ISbStoryData } from '@storyblok/js';

type CountryStory = ISbStoryData<Country>;

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewCountryPage = async ({ storyPath, lang, currency, previewRoutePath, searchParams }: Props) => {
	return await StoryblokPreviewStory<CountryStory>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (path, language) => {
			const storyResult = await getStoryWithFallbackAction<CountryStory>({ storyPath: path, language });

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: async (story) => {
			const [statsResult, communityResult] = await Promise.all([
				getCountryPageStatsAction(story.content.isoCode.toString()),
				getCommunityPanelDataAction({ page: story.content, language: lang, currency }),
			]);
			const { activeProgramsCount, recipientsCount } = statsResult.success
				? statsResult.data
				: { activeProgramsCount: 0, recipientsCount: 0 };

			return (
				<CountryDetail
					country={story}
					lang={lang}
					currency={currency}
					activeProgramsCount={activeProgramsCount}
					recipientsCount={recipientsCount}
					community={communityResult.success ? communityResult.data : null}
				/>
			);
		},
	});
};
