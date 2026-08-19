import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { Currency } from '@/generated/prisma/client';
import type { CampaignTableEntry } from '@/lib/services/campaign/campaign.types';
import { getCampaignTableView } from './campaigns-table.server';

jest.mock('@/generated/prisma/client', () => ({
	Currency: { CHF: 'CHF' },
}));

const createProgram = (portalSlug: string, title: string) =>
	({
		uuid: portalSlug,
		slug: portalSlug,
		content: {
			portalSlug,
			title,
			description: '',
			primaryImage: {},
			secondaryImage: {},
			tertiaryImage: {},
			fourthImage: {},
			component: 'program',
			_uid: portalSlug,
		},
	}) as ProgramStory;

const createEntry = ({
	id,
	programPortalSlug,
	programName,
	createdAt,
}: {
	id: string;
	programPortalSlug: string | null;
	programName: string | null;
	createdAt: string;
}): CampaignTableEntry => ({
	id,
	link: `/campaigns/${id}`,
	title: `Campaign ${id}`,
	description: `Description ${id}`,
	currency: Currency.CHF,
	endDate: new Date('2027-01-01T00:00:00.000Z'),
	isActive: true,
	programName,
	programPortalSlug,
	createdAt: new Date(createdAt),
});

describe('campaign table server helpers', () => {
	const entries = [
		createEntry({
			id: 'one',
			programPortalSlug: 'health',
			programName: 'Database health',
			createdAt: '2026-01-01T00:00:00.000Z',
		}),
		createEntry({
			id: 'two',
			programPortalSlug: 'missing',
			programName: 'Database fallback',
			createdAt: '2026-02-01T00:00:00.000Z',
		}),
	];

	it('uses the CMS program title and falls back to the database name', () => {
		const result = getCampaignTableView(entries, [createProgram('health', 'CMS health')], {
			page: 1,
			pageSize: 10,
			search: '',
		});

		expect(result.tableRows.map(({ programName }) => programName)).toEqual(['Database fallback', 'CMS health']);
	});

	it('searches and sorts using the CMS program title before paginating', () => {
		const result = getCampaignTableView(entries, [createProgram('health', 'CMS health')], {
			page: 1,
			pageSize: 10,
			search: 'cms health',
			sortBy: 'programName',
			sortDirection: 'asc',
		});

		expect(result.totalCount).toBe(1);
		expect(result.tableRows.map(({ id }) => id)).toEqual(['one']);
	});
});
