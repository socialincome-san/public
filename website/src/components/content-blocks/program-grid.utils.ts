import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramPortalSlug, getProgramTitle } from '@/components/storyblok/program/program.utils';
import type { ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import type { PublicProgramFilterDataMap, PublicProgramStatsMap } from '@/modules/programs/program.types';

export type ProgramGridFilter = {
	by: 'country' | 'focus' | 'localPartner';
	value: string;
};

export const programMatchesGridFilter = (
	program: ProgramStory,
	filter: ProgramGridFilter,
	filterDataByPortalSlug: PublicProgramFilterDataMap,
) => {
	const filterData = filterDataByPortalSlug[getProgramPortalSlug(program.content)];
	if (!filterData) {
		return false;
	}

	switch (filter.by) {
		case 'country':
			return filterData.countryIsoCode.toLowerCase() === filter.value.toLowerCase();
		case 'focus':
			return filterData.focuses.some(({ slug }) => slug === filter.value);
		case 'localPartner':
			return filterData.localPartnerSlugs.includes(filter.value);
	}
};

const getPublishedTime = (program: ProgramStory) => Date.parse(program.first_published_at ?? program.created_at) || 0;

export const sortGridPrograms = (
	programs: ProgramStory[],
	sortBy: ProgramGrid['sortBy'],
	statsByPortalSlug: PublicProgramStatsMap,
	lang: string,
) => {
	const getRecipientsCount = (program: ProgramStory) =>
		statsByPortalSlug[getProgramPortalSlug(program.content)]?.recipientsCount ?? 0;

	switch (sortBy) {
		case 'newest':
			return programs.toSorted((a, b) => getPublishedTime(b) - getPublishedTime(a));
		case 'recipients':
			return programs.toSorted((a, b) => getRecipientsCount(b) - getRecipientsCount(a));
		case 'alphabetical':
			return programs.toSorted((a, b) => getProgramTitle(a.content).localeCompare(getProgramTitle(b.content), lang));
		default:
			return programs;
	}
};

export const limitGridPrograms = (programs: ProgramStory[], maxPrograms: ProgramGrid['maxPrograms']) => {
	return maxPrograms ? programs.slice(0, Number(maxPrograms)) : programs;
};
