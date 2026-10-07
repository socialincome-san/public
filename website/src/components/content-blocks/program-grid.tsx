import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { ProgramGridView } from '@/components/content-blocks/program-grid-view';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getProgramsAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import { storyblokEditable } from '@storyblok/react';

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
		<BlockWrapper marginTop={blok.marginTop} marginBottom={blok.marginBottom} {...storyblokEditable(blok)}>
			{blok.heading && (
				<div className="mb-8 md:mb-10">
					<SectionHeading size={3}>
						<StoryblokMarkdown>{blok.heading}</StoryblokMarkdown>
					</SectionHeading>
				</div>
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
