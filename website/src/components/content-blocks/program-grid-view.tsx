import { Button } from '@/components/button/button';
import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramPortalSlug } from '@/components/storyblok/program/program.utils';
import { ProgramsOverview } from '@/components/storyblok/program/programs-overview';
import type { ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import { services } from '@/lib/services/services';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import NextLink from 'next/link';

type Props = {
	programs: ProgramStory[];
	allProgramsCount?: number;
	blok: ProgramGrid;
};

export const ProgramGridView = async ({ programs, allProgramsCount = 0, blok }: Props) => {
	const { lang, region } = await getWebsiteRootParams();
	const programPortalSlugs = [...new Set(programs.map((program) => getProgramPortalSlug(program.content)).filter(Boolean))];
	const statsResult = await services.read.program.getPublicProgramStatsByProgramPortalSlugs(programPortalSlugs);
	const statsByPortalSlug = statsResult.success ? statsResult.data : {};
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, region) : null;
	const buttonLabel = translator.t('programs-page.view-all', { context: { count: allProgramsCount } });

	return (
		<>
			<ProgramsOverview programs={programs} statsByPortalSlug={statsByPortalSlug} />
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
