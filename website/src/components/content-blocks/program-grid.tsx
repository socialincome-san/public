import { BlockWrapper } from '@/components/block-wrapper';
import { ProgramGridView } from '@/components/content-blocks/program-grid-view';
import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import type { ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import Markdown from 'react-markdown';

type Props = {
	blok: ProgramGrid;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramGridBlock = async ({ blok, lang, region }: Props) => {
	const programsResult = await services.storyblok.getPrograms(lang);
	const allPrograms = programsResult.success ? programsResult.data : [];
	const programs = blok.showAllPrograms ? allPrograms : resolveSelectedStories(blok.programs, allPrograms);

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			{blok.heading && (
				<h2 className="mb-8 text-center text-3xl leading-[1.2] whitespace-pre-line md:text-4xl xl:text-5xl [&_strong]:font-bold">
					<Markdown components={{ p: ({ children }) => <>{children}</> }}>{blok.heading}</Markdown>
				</h2>
			)}
			{blok.description && (
				<p className="text-foreground -mt-4 mb-10 text-center text-lg leading-7 font-normal whitespace-pre-line">
					<Markdown components={{ p: ({ children }) => <>{children}</> }}>{blok.description}</Markdown>
				</p>
			)}
			<ProgramGridView programs={programs} blok={blok} lang={lang} region={region} />
		</BlockWrapper>
	);
};
