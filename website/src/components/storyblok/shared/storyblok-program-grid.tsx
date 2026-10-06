import { ProgramGridView } from '@/components/content-blocks/program-grid-view';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { ProgramStory } from '@/components/storyblok/program/program.types';
import type { ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: ProgramGrid;
	programs: ProgramStory[];
	allProgramsCount?: number;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const StoryblokProgramGrid = ({ blok, programs, allProgramsCount = 0, lang, region }: Props) => {
	if (programs.length === 0) {
		return null;
	}

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			{blok.heading && (
				<div className="mb-8 md:mb-10">
					<SectionHeading size={3}>
						<StoryblokMarkdown>{blok.heading}</StoryblokMarkdown>
					</SectionHeading>
				</div>
			)}
			{blok.description && (
				<div className="text-foreground -mt-4 mb-10 text-center text-lg leading-7 font-normal whitespace-pre-line">
					<StoryblokMarkdown>{blok.description}</StoryblokMarkdown>
				</div>
			)}
			<ProgramGridView programs={programs} allProgramsCount={allProgramsCount} blok={blok} lang={lang} region={region} />
		</BlockWrapper>
	);
};
