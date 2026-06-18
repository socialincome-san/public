import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { StoryblokProgramGrid } from '@/components/storyblok/shared/storyblok-program-grid';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { CountryStory } from './country.types';

type Props = {
	country: CountryStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CountryPrograms = async ({ country, lang, region }: Props) => {
	const blok = country.content.programs?.[0];
	if (!blok) {
		return null;
	}

	const programsResult = await services.storyblok.getPrograms(lang);
	const allPrograms = programsResult.success ? programsResult.data : [];
	const programs = blok.showAllPrograms ? allPrograms : resolveSelectedStories(blok.programs, allPrograms);

	return (
		<StoryblokProgramGrid
			blok={blok}
			programs={programs}
			allProgramsCount={allPrograms.length}
			lang={lang}
			region={region}
		/>
	);
};
