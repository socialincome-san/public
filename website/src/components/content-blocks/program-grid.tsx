import { BlockWrapper } from '@/components/block-wrapper';
import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { ProgramGridView } from '@/components/content-blocks/program-grid-view';
import { SectionHeading } from '@/components/section-heading';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import { services } from '@/lib/services/services';
import { SbBlokData, storyblokEditable } from '@storyblok/react';

type Props = {
	blok: ProgramGrid;
};

export const ProgramGridBlock = async ({ blok }: Props) => {
	const { lang } = await getWebsiteRootParams();
	const programsResult = await services.storyblok.getPrograms(lang);
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
			<ProgramGridView programs={programs} allProgramsCount={allPrograms.length} blok={blok} />
		</BlockWrapper>
	);
};
