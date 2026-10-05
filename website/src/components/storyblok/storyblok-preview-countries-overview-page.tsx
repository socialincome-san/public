import { CountriesOverviewPage } from '@/components/storyblok/country/countries-overview-page';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import type { CountryOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getStoryWithFallbackAction } from '@/modules/storyblok-content/storyblok-content.actions';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewCountriesOverviewPage = async ({
	storyPath,
	lang,
	region,
	previewRoutePath,
	searchParams,
}: Props) => {
	return await StoryblokPreviewStory<ISbStoryData<CountryOverview>>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (path, language) => {
			const storyResult = await getStoryWithFallbackAction<ISbStoryData<CountryOverview>>({
				storyPath: path,
				language,
			});

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: (overview) => <CountriesOverviewPage overview={overview} lang={lang} region={region} />,
	});
};
