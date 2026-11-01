import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import {
	limitGridPrograms,
	programMatchesGridFilter,
	sortGridPrograms,
	type ProgramGridFilter,
} from '@/components/content-blocks/program-grid.utils';
import { getLocalPartnerPortalSlug } from '@/components/storyblok/local-partner/local-partner.utils';
import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramPortalSlug } from '@/components/storyblok/program/program.utils';
import { ProgramsOverview } from '@/components/storyblok/program/programs-overview';
import type { ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import type { Result } from '@/lib/result';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import {
	getPublicProgramFilterDataByPortalSlugsAction,
	getPublicProgramStatsByPortalSlugsAction,
} from '@/modules/programs/program.actions';
import type { PublicProgramStatsMap } from '@/modules/programs/program.types';
import {
	getCountriesAction,
	getFocusesAction,
	getLocalPartnersAction,
	getProgramsAction,
} from '@/modules/storyblok-content/storyblok-content.actions';
import { Button } from '@socialincome/design-system/actions/button/button';
import type { ISbStoryData } from '@storyblok/js';
import { getTranslations } from 'next-intl/server';
import NextLink from 'next/link';

const getPortalSlugs = (programs: ProgramStory[]) => [
	...new Set(programs.map((program) => getProgramPortalSlug(program.content)).filter(Boolean)),
];

const findSelectedStory = async <T,>(
	selected: ISbStoryData<T> | string | undefined,
	fetchStories: () => Promise<Result<ISbStoryData<T>[]>>,
) => {
	if (!selected) {
		return undefined;
	}
	if (typeof selected !== 'string') {
		return selected;
	}
	const storiesResult = await fetchStories();

	return storiesResult.success ? resolveSelectedStories([selected], storiesResult.data).at(0) : undefined;
};

const resolveGridFilterValue = async (blok: ProgramGrid, lang: WebsiteLanguage) => {
	switch (blok.filterBy) {
		case 'country': {
			const country = await findSelectedStory(blok.filterCountry, () => getCountriesAction(lang));

			return country?.content.isoCode.toString().trim();
		}
		case 'focus': {
			const focus = await findSelectedStory(blok.filterFocus, () => getFocusesAction(lang));

			return focus?.content.portalSlug.trim();
		}
		case 'localPartner': {
			const localPartner = await findSelectedStory(blok.filterLocalPartner, () => getLocalPartnersAction(lang));

			return localPartner && getLocalPartnerPortalSlug(localPartner.content);
		}
		default:
			return undefined;
	}
};

const getCandidatePrograms = async (blok: ProgramGrid, allPrograms: ProgramStory[], lang: WebsiteLanguage) => {
	if (!blok.filterBy) {
		return blok.showAllPrograms ? allPrograms : resolveSelectedStories(blok.programs, allPrograms);
	}
	const value = await resolveGridFilterValue(blok, lang);
	if (!value) {
		return [];
	}
	const filter: ProgramGridFilter = { by: blok.filterBy, value };
	const filterDataResult = await getPublicProgramFilterDataByPortalSlugsAction(getPortalSlugs(allPrograms));
	const filterDataByPortalSlug = filterDataResult.success ? filterDataResult.data : {};

	return allPrograms.filter((program) => programMatchesGridFilter(program, filter, filterDataByPortalSlug));
};

export const getProgramGridPrograms = async (blok: ProgramGrid, lang: WebsiteLanguage) => {
	const programsResult = await getProgramsAction(lang);
	const allPrograms = programsResult.success ? programsResult.data : [];
	const candidates = await getCandidatePrograms(blok, allPrograms, lang);
	const statsResult = await getPublicProgramStatsByPortalSlugsAction(getPortalSlugs(candidates));
	const statsByPortalSlug = statsResult.success ? statsResult.data : {};
	const visiblePrograms = blok.hideConcludedPrograms
		? candidates.filter((program) => !statsByPortalSlug[getProgramPortalSlug(program.content)]?.isConcluded)
		: candidates;
	const programs = limitGridPrograms(
		sortGridPrograms(visiblePrograms, blok.sortBy, statsByPortalSlug, lang),
		blok.maxPrograms,
	);

	return { programs, statsByPortalSlug, allProgramsCount: allPrograms.length };
};

type Props = {
	programs: ProgramStory[];
	statsByPortalSlug: PublicProgramStatsMap;
	allProgramsCount?: number;
	blok: ProgramGrid;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const ProgramGridView = async ({
	programs,
	statsByPortalSlug,
	allProgramsCount = 0,
	blok,
	lang,
	currency,
}: Props) => {
	const t = await getTranslations('website-common');
	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, currency) : null;
	const buttonLabel = t('programs-page.view-all', { count: allProgramsCount });

	return (
		<>
			<ProgramsOverview programs={programs} statsByPortalSlug={statsByPortalSlug} lang={lang} currency={currency} />
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
