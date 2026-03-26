import { CountryDetail } from '@/components/storyblok/country/country-detail';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { Country } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { ISbStoryData } from '@storyblok/js';

type CountryStory = ISbStoryData<Country>;

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

const getCountryStats = async (isoCode: string) => {
	const statsResult = await services.read.country.getPublicCountryStatsByIsoCode(isoCode);

	return {
		activeProgramsCount: statsResult.success ? statsResult.data.programsCount : 0,
		recipientsCount: statsResult.success ? statsResult.data.recipientsCount : 0,
	};
};

export const StoryblokPreviewCountryPage = ({ storyPath, lang, region, previewRoutePath, searchParams }: Props) => {
	return (
		<StoryblokPreviewStory<CountryStory>
			storyPath={storyPath}
			lang={lang}
			previewRoutePath={previewRoutePath}
			searchParams={searchParams}
			loadStory={async (path, language) => {
				const storyResult = await services.storyblok.getStoryWithFallback<CountryStory>(path, language);

				return storyResult.success ? storyResult.data : null;
			}}
			renderStory={async (story) => {
				const { activeProgramsCount, recipientsCount } = await getCountryStats(story.content.isoCode);

				return (
					<CountryDetail
						country={story}
						lang={lang}
						region={region}
						activeProgramsCount={activeProgramsCount}
						recipientsCount={recipientsCount}
					/>
				);
			}}
		/>
	);
};
