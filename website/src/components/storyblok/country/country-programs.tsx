import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { StoryblokProgramGrid } from '@/components/storyblok/shared/storyblok-program-grid';
import { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getProgramsAction } from '@/modules/storyblok-content/storyblok-content.actions';
import type { CountryStory } from './country.types';

type Props = {
	country: CountryStory;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const CountryPrograms = async ({ country, lang, currency }: Props) => {
	const blok = country.content.programs?.[0];
	if (!blok) {
		return null;
	}

	const programsResult = await getProgramsAction(lang);
	const allPrograms = programsResult.success ? programsResult.data : [];
	const programs = blok.showAllPrograms ? allPrograms : resolveSelectedStories(blok.programs, allPrograms);

	return (
		<StoryblokProgramGrid
			blok={blok}
			programs={programs}
			allProgramsCount={allPrograms.length}
			lang={lang}
			currency={currency}
		/>
	);
};
