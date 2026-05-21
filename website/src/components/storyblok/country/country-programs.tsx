import { BlockWrapper } from '@/components/block-wrapper';
import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { ProgramGridView } from '@/components/content-blocks/program-grid-view';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import Markdown from 'react-markdown';
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
			{[blok.heading, blok.description].some(Boolean) && (
				<div className="mb-10 text-center">
					{blok.heading && (
						<h2 className="m-0 text-3xl leading-[1.2] font-normal whitespace-pre-line md:text-4xl xl:text-5xl">
							<Markdown components={{ p: ({ children }) => <>{children}</> }}>{blok.heading}</Markdown>
						</h2>
					)}
					{blok.description && (
						<p className="text-foreground m-0 text-3xl leading-[1.2] font-bold whitespace-pre-line md:text-4xl xl:text-5xl">
							<Markdown components={{ p: ({ children }) => <>{children}</> }}>{blok.description}</Markdown>
						</p>
					)}
				</div>
			)}
			<ProgramGridView programs={programs} blok={blok} lang={lang} region={region} />
		</BlockWrapper>
	);
};
