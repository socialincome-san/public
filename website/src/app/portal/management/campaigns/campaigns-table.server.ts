import type { CampaignStory } from '@/components/storyblok/campaign/campaign.types';
import { getStoryblokCampaignTitleForSlug } from '@/components/storyblok/campaign/campaign.utils';
import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramPortalSlug, getProgramTitle } from '@/components/storyblok/program/program.utils';
import { defaultLanguage, defaultRegion } from '@/lib/i18n/utils';
import type {
	CampaignPaginatedTableView,
	CampaignTableEntry,
	CampaignTableQuery,
	CampaignTableViewRow,
} from '@/lib/services/campaign/campaign.types';

const compareNullableStrings = (left: string | null, right: string | null) => {
	return (left ?? '').localeCompare(right ?? '', undefined, { sensitivity: 'base' });
};

const compareRows = (left: CampaignTableViewRow, right: CampaignTableViewRow, sortBy?: string) => {
	switch (sortBy) {
		case 'id':
			return compareNullableStrings(left.id, right.id);
		case 'title':
			return compareNullableStrings(left.title, right.title);
		case 'currency':
			return compareNullableStrings(left.currency, right.currency);
		case 'endDate':
			return left.endDate.getTime() - right.endDate.getTime();
		case 'isActive':
			return Number(left.isActive) - Number(right.isActive);
		case 'programName':
			return compareNullableStrings(left.programName, right.programName);
		case 'createdAt':
		default:
			return left.createdAt.getTime() - right.createdAt.getTime();
	}
};

const matchesSearch = (row: CampaignTableViewRow, search: string) => {
	const normalizedSearch = search.trim().toLocaleLowerCase();
	if (!normalizedSearch) {
		return true;
	}

	return [row.id, row.slug, row.title, row.programName, row.link].some((value) =>
		value?.toLocaleLowerCase().includes(normalizedSearch),
	);
};

export const getCampaignTableView = (
	entries: CampaignTableEntry[],
	campaignStories: CampaignStory[],
	programStories: ProgramStory[],
	query: CampaignTableQuery,
): CampaignPaginatedTableView => {
	const programStoryByPortalSlug = new Map(
		programStories.map((story) => [getProgramPortalSlug(story.content), story] as const),
	);
	const rows = entries.map<CampaignTableViewRow>(({ programPortalSlug, ...entry }) => {
		const programStory = programPortalSlug ? programStoryByPortalSlug.get(programPortalSlug) : undefined;

		return {
			...entry,
			title: getStoryblokCampaignTitleForSlug(campaignStories, entry.slug),
			link: `/${defaultLanguage}/${defaultRegion}/campaigns/${entry.slug}`,
			programName: programStory ? getProgramTitle(programStory.content) : entry.programName,
		};
	});
	const matchingRows = rows.filter((row) => matchesSearch(row, query.search));
	const direction = query.sortBy && query.sortDirection === 'asc' ? 1 : -1;
	const sortedRows = matchingRows.sort((left, right) => direction * compareRows(left, right, query.sortBy));
	const offset = (query.page - 1) * query.pageSize;

	return {
		tableRows: sortedRows.slice(offset, offset + query.pageSize),
		totalCount: matchingRows.length,
	};
};
