import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramPortalSlug } from '@/components/storyblok/program/program.utils';
import { ProgramsOverview } from '@/components/storyblok/program/programs-overview';
import type { ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { getPublicProgramStatsByPortalSlugsAction } from '@/modules/programs/program.actions';
import { Button } from '@socialincome/design-system/actions/button/button';
import { getTranslations } from 'next-intl/server';
import NextLink from 'next/link';

type Props = {
	programs: ProgramStory[];
	allProgramsCount?: number;
	blok: ProgramGrid;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramGridView = async ({ programs, allProgramsCount = 0, blok, lang, region }: Props) => {
	const programPortalSlugs = [...new Set(programs.map((program) => getProgramPortalSlug(program.content)).filter(Boolean))];
	const [statsResult, t] = await Promise.all([
		getPublicProgramStatsByPortalSlugsAction(programPortalSlugs),
		getTranslations('website-common'),
	]);
	const statsByPortalSlug = statsResult.success ? statsResult.data : {};
	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, region) : null;
	const buttonLabel = t('programs-page.view-all', { count: allProgramsCount });

	return (
		<>
			<ProgramsOverview programs={programs} statsByPortalSlug={statsByPortalSlug} lang={lang} region={region} />
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
