import { BlockWrapper } from '@/components/block-wrapper';
import { ProgramGridView } from '@/components/content-blocks/program-grid-view';
import { SectionHeading } from '@/components/section-heading';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { ProgramStory } from '@/components/storyblok/program/program.types';
import type { ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
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
				<SectionHeading size={3} className="leading-[1.2] whitespace-pre-line">
					<StoryblokMarkdown>{blok.heading}</StoryblokMarkdown>
				</SectionHeading>
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
