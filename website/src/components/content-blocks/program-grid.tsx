import { BlockWrapper } from '@/components/block-wrapper';
import { Button } from '@/components/button';
import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { SectionHeading } from '@/components/section-heading';
import { getProgramId } from '@/components/storyblok/program/program.utils';
import { ProgramsOverview } from '@/components/storyblok/program/programs-overview';
import type { ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import NextLink from 'next/link';
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
	const programIds = [...new Set(programs.map((program) => getProgramId(program.content)).filter(Boolean))];
	const statsResult = await services.read.program.getPublicProgramStatsByIds(programIds);
	const statsById = statsResult.success ? statsResult.data : {};
	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, region) : null;

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			{blok.heading && (
				<SectionHeading className="text-3xl leading-[1.2] whitespace-pre-line md:text-4xl xl:text-5xl">
					<Markdown components={{ p: ({ children }) => <>{children}</> }}>{blok.heading}</Markdown>
				</SectionHeading>
			)}
			{blok.description && (
				<p className="text-foreground -mt-4 mb-10 text-center text-lg leading-7 font-normal whitespace-pre-line">
					<Markdown components={{ p: ({ children }) => <>{children}</> }}>{blok.description}</Markdown>
				</p>
			)}
			<ProgramsOverview programs={programs} statsById={statsById} lang={lang} region={region} />
			{button && buttonHref && (
				<div className="mt-10 flex justify-center">
					<Button variant="outline" asChild>
						<NextLink href={buttonHref}>{button.label}</NextLink>
					</Button>
				</div>
			)}
		</BlockWrapper>
	);
};
