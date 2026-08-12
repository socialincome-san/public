import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { StoryblokProgramGrid } from '@/components/storyblok/shared/storyblok-program-grid';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import { services } from '@/lib/services/services';
import type { CountryStory } from './country.types';

type Props = {
	country: CountryStory;
};

export const CountryPrograms = async ({ country }: Props) => {
	const { lang } = await getWebsiteRootParams();
	const blok = country.content.programs?.[0];
	if (!blok) {
		return null;
	}

	const programsResult = await services.storyblok.getPrograms(lang);
	const allPrograms = programsResult.success ? programsResult.data : [];
	const programs = blok.showAllPrograms ? allPrograms : resolveSelectedStories(blok.programs, allPrograms);

	return <StoryblokProgramGrid blok={blok} programs={programs} allProgramsCount={allPrograms.length} />;
};
