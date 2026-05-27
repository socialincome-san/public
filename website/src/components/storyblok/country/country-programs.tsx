import { BlockWrapper } from '@/components/block-wrapper';
import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { ProgramGridView } from '@/components/content-blocks/program-grid-view';
import { SectionHeading } from '@/components/section-heading';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import type { CountryStory } from './country.types';
import { getCountryIsoCode } from './country.utils';

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

	const isoCode = getCountryIsoCode(country.content);
	const programsResult = await services.storyblok.getCountryPrograms(lang, isoCode);
	const allPrograms = programsResult.success ? programsResult.data : [];
	const programs = blok.showAllPrograms ? allPrograms : resolveSelectedStories(blok.programs, allPrograms);

	if (programs.length === 0) {
		return null;
	}

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			{blok.heading && (
				<SectionHeading size="large">
					<StoryblokMarkdown>{blok.heading}</StoryblokMarkdown>
				</SectionHeading>
			)}
			{blok.description && (
				<p className="text-foreground -mt-4 mb-10 text-center text-lg leading-7 font-normal whitespace-pre-line">
					<StoryblokMarkdown>{blok.description}</StoryblokMarkdown>
				</p>
			)}
			<ProgramGridView programs={programs} blok={blok} lang={lang} region={region} />
		</BlockWrapper>
	);
};
