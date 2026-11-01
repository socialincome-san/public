import { getProgramGridPrograms } from '@/components/content-blocks/program-grid-view';
import { StoryblokProgramGrid } from '@/components/storyblok/shared/storyblok-program-grid';
import { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
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

	const { programs, statsByPortalSlug, allProgramsCount } = await getProgramGridPrograms(blok, lang);

	return (
		<StoryblokProgramGrid
			blok={blok}
			programs={programs}
			statsByPortalSlug={statsByPortalSlug}
			allProgramsCount={allProgramsCount}
			lang={lang}
			currency={currency}
		/>
	);
};
