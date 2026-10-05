import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { ProgramGridView } from '@/components/content-blocks/program-grid-view';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getProgramsAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { BlockWrapper } from '@socialincome/design-system/block-wrapper/block-wrapper';
import { SectionHeading } from '@socialincome/design-system/section-heading/section-heading';
import { SbBlokData, storyblokEditable } from '@storyblok/react';

type Props = {
	blok: ProgramGrid;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramGridBlock = async ({ blok, lang, region }: Props) => {
	const programsResult = await getProgramsAction(lang);
	const allPrograms = programsResult.success ? programsResult.data : [];
	const programs = blok.showAllPrograms ? allPrograms : resolveSelectedStories(blok.programs, allPrograms);

	return (
		<BlockWrapper
			disableMarginTop={blok.disableMarginTop}
			disableMarginBottom={blok.disableMarginBottom}
			{...storyblokEditable(blok as SbBlokData)}
		>
			{blok.heading && (
				<SectionHeading size={3} className="leading-[1.2] whitespace-pre-line">
					<StoryblokMarkdown>{blok.heading}</StoryblokMarkdown>
				</SectionHeading>
			)}
			{blok.description && (
				<p className="text-foreground -mt-4 mb-10 text-center text-lg leading-7 font-normal whitespace-pre-line">
					<StoryblokMarkdown>{blok.description}</StoryblokMarkdown>
				</p>
			)}
			<ProgramGridView programs={programs} allProgramsCount={allPrograms.length} blok={blok} lang={lang} region={region} />
		</BlockWrapper>
	);
};
