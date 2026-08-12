import { CountryDetail } from '@/components/storyblok/country/country-detail';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { Country } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { getCountryPageStats } from '@/lib/storyblok/country-page-stats';
import type { ISbStoryData } from '@storyblok/js';

type CountryStory = ISbStoryData<Country>;

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewCountryPage = async ({ storyPath, lang, previewRoutePath, searchParams }: Props) => {
	return await StoryblokPreviewStory<CountryStory>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (path, language) => {
			const storyResult = await services.storyblok.getStoryWithFallback<CountryStory>(path, language);

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: async (story) => {
			const { activeProgramsCount, recipientsCount } = await getCountryPageStats(story.content.isoCode.toString());

			return <CountryDetail country={story} activeProgramsCount={activeProgramsCount} recipientsCount={recipientsCount} />;
		},
	});
};
