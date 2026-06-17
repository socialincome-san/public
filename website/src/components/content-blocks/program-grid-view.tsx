import { Button } from '@/components/button';
import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramPortalSlug } from '@/components/storyblok/program/program.utils';
import { ProgramsOverview } from '@/components/storyblok/program/programs-overview';
import type { ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import NextLink from 'next/link';

type Props = {
	programs: ProgramStory[];
	allProgramsCount?: number;
	blok: ProgramGrid;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramGridView = async ({ programs, allProgramsCount = 0, blok, lang, region }: Props) => {
	const programIds = [...new Set(programs.map((program) => getProgramPortalSlug(program.content)).filter(Boolean))];
	const statsResult = await services.read.program.getPublicProgramStatsByIds(programIds);
	const statsById = statsResult.success ? statsResult.data : {};
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, region) : null;
	const buttonLabel = translator.t('programs-page.view-all', { context: { count: allProgramsCount } });

	return (
		<>
			<ProgramsOverview programs={programs} statsByPortalSlug={statsById} lang={lang} region={region} />
			{button && buttonHref && (
				<div className="mt-10 flex justify-center">
					<Button variant="outline" asChild>
						<NextLink href={buttonHref}>{buttonLabel}</NextLink>
					</Button>
				</div>
			)}
		</>
	);
};
