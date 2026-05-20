import { Button } from '@/components/button';
import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramId } from '@/components/storyblok/program/program.utils';
import { ProgramsOverview } from '@/components/storyblok/program/programs-overview';
import type { ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import NextLink from 'next/link';

type Props = {
	programs: ProgramStory[];
	blok: ProgramGrid;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramGridView = async ({ programs, blok, lang, region }: Props) => {
	const programIds = [...new Set(programs.map((program) => getProgramId(program.content)).filter(Boolean))];
	const statsResult = await services.read.program.getPublicProgramStatsByIds(programIds);
	const statsById = statsResult.success ? statsResult.data : {};
	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, region) : null;

	return (
		<>
			<ProgramsOverview programs={programs} statsById={statsById} lang={lang} region={region} />
			{button && buttonHref && (
				<div className="mt-10 flex justify-center">
					<Button variant="outline" asChild>
						<NextLink href={buttonHref}>{button.label}</NextLink>
					</Button>
				</div>
			)}
		</>
	);
};
