import { ProgramPermission } from '@/generated/prisma/enums';
import type { Result } from '@/lib/result';
import type * as ContributionRepository from './contribution.repository.read';
import type { ContributionPaginatedTableView, ContributionTableQuery, GlobeContribution } from './contribution.types';

type ContributionRow = {
	id: string;
	amount: string;
	currency: string;
	createdAt: Date;
	contributor: {
		contact: {
			address: { country: string | null } | null;
		} | null;
	};
};

type FindManyQuery = {
	where: {
		status: string;
		createdAt: { gte: Date };
	};
	select: Record<string, unknown>;
	orderBy: { createdAt: string };
	take: number;
};

const mockFindMany = jest.fn<Promise<ContributionRow[]>, [FindManyQuery]>();
const mockCount = jest.fn<Promise<number>, [unknown]>();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		contribution: { findMany: mockFindMany, count: mockCount },
	},
}));

jest.mock('@/lib/types/country', () => ({
	getCountryNameByCode: (code: string) => `Country(${code})`,
	isValidCountryCode: (code: string) => Boolean(code),
}));

const mockGetAccessiblePrograms = jest.fn();
const mockGetContributorFilterOption = jest.fn();
const mockFindCampaignsByProgramIds = jest.fn();
const mockFindContributionTableSource = jest.fn();

jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: mockGetAccessiblePrograms,
}));

jest.mock('@/modules/contributors/contributor.service', () => ({
	findContributorById: jest.fn(),
	getContributorFilterOption: mockGetContributorFilterOption,
	getEditableContributorOptions: jest.fn(),
}));

jest.mock('@/modules/storyblok-content/storyblok-content.cache', () => ({
	getCampaigns: jest.fn().mockResolvedValue({ success: true, data: [] }),
}));

jest.mock('./contribution.repository.write', () => ({}));

jest.mock('./contribution.repository.read', () => ({
	...jest.requireActual<typeof ContributionRepository>('./contribution.repository.read'),
	findCampaignsByProgramIds: mockFindCampaignsByProgramIds,
	findContributionTableSource: mockFindContributionTableSource,
}));

const makeRow = (overrides: Partial<ContributionRow> = {}): ContributionRow => ({
	id: 'cid-1',
	amount: '42.0000',
	currency: 'CHF',
	createdAt: new Date('2026-08-10T14:32:00.000Z'),
	contributor: {
		contact: {
			address: { country: 'CH' },
		},
	},
	...overrides,
});

const getFindManyQuery = () => {
	const query = mockFindMany.mock.calls.at(-1)?.[0];
	if (!query) {
		throw new Error('Expected contribution.findMany to be called.');
	}

	return query;
};

const expectSuccess = <T>(result: Result<T>) => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

let getRecentSuccessfulContributions: (days: number) => Promise<Result<GlobeContribution[]>>;
let getPaginatedTableView: (
	userId: string,
	query: ContributionTableQuery,
) => Promise<Result<ContributionPaginatedTableView>>;
let hasSucceededContributionsBefore: (contributorId: string, before: Date) => Promise<Result<boolean>>;

beforeAll(async () => {
	({ getRecentSuccessfulContributions, getPaginatedTableView, hasSucceededContributionsBefore } =
		await import('./contribution.service'));
});

describe('hasSucceededContributionsBefore', () => {
	const before = new Date('2026-10-20T08:00:00.000Z');

	it('counts only succeeded contributions of the contributor created before the given time', async () => {
		mockCount.mockResolvedValueOnce(2);

		expect(expectSuccess(await hasSucceededContributionsBefore('contributor-1', before))).toBe(true);
		expect(mockCount).toHaveBeenLastCalledWith({
			where: { contributorId: 'contributor-1', status: 'succeeded', createdAt: { lt: before } },
		});
	});

	it('is false without earlier contributions', async () => {
		mockCount.mockResolvedValueOnce(0);

		expect(expectSuccess(await hasSucceededContributionsBefore('contributor-1', before))).toBe(false);
	});
});

describe('getRecentSuccessfulContributions', () => {
	const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

	beforeEach(() => {
		mockFindMany.mockReset();
		consoleWarn.mockClear();
	});

	const fixedTime = process.env.NEXT_PUBLIC_FIXED_TIME;

	beforeAll(() => {
		process.env.NEXT_PUBLIC_FIXED_TIME = '2026-08-19T00:00:00.000Z';
	});

	afterAll(() => {
		consoleWarn.mockRestore();
		if (fixedTime === undefined) {
			delete process.env.NEXT_PUBLIC_FIXED_TIME;
		} else {
			process.env.NEXT_PUBLIC_FIXED_TIME = fixedTime;
		}
	});

	const cutoff = new Date('2026-08-05T00:00:00.000Z');

	it('queries only succeeded contributions created within the given days', async () => {
		mockFindMany.mockResolvedValue([]);
		await getRecentSuccessfulContributions(14);

		const { where } = getFindManyQuery();
		expect(where.status).toBe('succeeded');
		expect(where.createdAt).toEqual({ gte: cutoff });
	});

	it('orders by createdAt descending', async () => {
		mockFindMany.mockResolvedValue([]);
		await getRecentSuccessfulContributions(14);

		expect(getFindManyQuery().orderBy).toEqual({ createdAt: 'desc' });
	});

	it('caps the public contribution payload', async () => {
		mockFindMany.mockResolvedValue([]);
		await getRecentSuccessfulContributions(14);

		expect(getFindManyQuery().take).toBe(200);
	});

	it('selects only the public globe fields', async () => {
		mockFindMany.mockResolvedValue([]);
		await getRecentSuccessfulContributions(14);

		const { select } = getFindManyQuery();

		expect(select).toHaveProperty('amount', true);
		expect(select).toHaveProperty('currency', true);
		expect(select).toHaveProperty('createdAt', true);
		expect(select).not.toHaveProperty('id');
		expect(select).not.toHaveProperty('amountChf');
		expect(select).not.toHaveProperty('feesChf');
		expect(select).not.toHaveProperty('legacyFirestoreId');
	});

	it('loads the country through contributor → contact → address', async () => {
		mockFindMany.mockResolvedValue([]);
		await getRecentSuccessfulContributions(14);

		const { select } = getFindManyQuery();

		expect(select).toHaveProperty('contributor');
	});

	it('maps a database row to the public GlobeContribution DTO', async () => {
		mockFindMany.mockResolvedValue([makeRow()]);
		const contributions = expectSuccess(await getRecentSuccessfulContributions(14));

		expect(contributions).toHaveLength(1);
		const dto = contributions[0];
		expect(dto?.key).toBe('contribution-0');
		expect(dto?.amount).toBe(42);
		expect(dto?.currency).toBe('CHF');
		expect(dto?.contributedAt).toBe('2026-08-10T14:32:00.000Z');
		expect(dto?.countryCode).toBe('CH');
		expect(dto?.countryName).toBe('Country(CH)');
	});

	it('excludes contributions without a country and logs the skipped count', async () => {
		mockFindMany.mockResolvedValue([
			makeRow({ contributor: { contact: { address: { country: null } } } }),
			makeRow({ id: 'cid-2' }),
		]);
		const contributions = expectSuccess(await getRecentSuccessfulContributions(14));

		expect(contributions).toHaveLength(1);
		expect(contributions[0]?.key).toBe('contribution-0');
		expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('Skipped 1'));
	});

	it('excludes contributions with no address at all', async () => {
		mockFindMany.mockResolvedValue([makeRow({ contributor: { contact: { address: null } } })]);
		const contributions = expectSuccess(await getRecentSuccessfulContributions(14));

		expect(contributions).toHaveLength(0);
		expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('Skipped 1'));
	});

	it('returns an empty array without error when no contributions exist', async () => {
		mockFindMany.mockResolvedValue([]);
		const contributions = expectSuccess(await getRecentSuccessfulContributions(14));

		expect(contributions).toEqual([]);
	});

	it('returns a service failure when the database throws', async () => {
		mockFindMany.mockRejectedValue(new Error('DB unavailable'));
		const result = await getRecentSuccessfulContributions(14);

		expect(result.success).toBe(false);
	});

	it('does not expose contributor ID in the DTO', async () => {
		mockFindMany.mockResolvedValue([makeRow()]);
		const contributions = expectSuccess(await getRecentSuccessfulContributions(14));

		const dto = contributions[0] as Record<string, unknown>;
		expect(dto).not.toHaveProperty('id');
		expect(dto).not.toHaveProperty('contributorId');
		expect(dto).not.toHaveProperty('email');
		expect(dto).not.toHaveProperty('firstName');
		expect(dto).not.toHaveProperty('lastName');
	});
});

describe('getPaginatedTableView contributor filter', () => {
	const query = { page: 1, pageSize: 10, search: '', contributorId: 'contributor-1' };

	beforeEach(() => {
		jest.clearAllMocks();
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [{ programId: 'program-1', programName: 'Program 1', permission: ProgramPermission.operator }],
		});
		mockFindCampaignsByProgramIds.mockResolvedValue([
			{ id: 'campaign-1', slug: null, program: { id: 'program-1', name: 'Program 1' } },
		]);
		mockFindContributionTableSource.mockResolvedValue({ contributions: [], totalCount: 0 });
	});

	test('filters by an accessible contributor and offers it as filter option', async () => {
		mockGetContributorFilterOption.mockResolvedValue({ success: true, data: { id: 'contributor-1', name: 'Ada Lovelace' } });

		const data = expectSuccess(await getPaginatedTableView('user-1', query));

		expect(mockGetContributorFilterOption).toHaveBeenCalledWith('contributor-1', ['program-1']);
		expect(mockFindContributionTableSource).toHaveBeenCalledWith(
			expect.objectContaining({ campaignIds: ['campaign-1'], contributorId: 'contributor-1' }),
		);
		expect(data.filterOptions.contributors).toEqual([{ value: 'contributor-1', label: 'Ada Lovelace' }]);
	});

	test('labels contributions and filter options of slugless campaigns with the campaign id', async () => {
		mockGetContributorFilterOption.mockResolvedValue({ success: true, data: null });
		mockFindContributionTableSource.mockResolvedValue({
			contributions: [
				{
					id: 'contribution-1',
					contributor: { contact: null },
					amount: 41.2,
					currency: 'CHF',
					campaign: { id: 'campaign-1', slug: null, program: { name: 'Program 1' } },
					paymentEvent: null,
					createdAt: new Date('2025-01-01T00:00:00.000Z'),
				},
			],
			totalCount: 1,
		});

		const data = expectSuccess(await getPaginatedTableView('user-1', query));

		expect(data.filterOptions.campaigns).toEqual([{ value: 'campaign-1', label: 'Campaign campaign-1' }]);
		expect(data.tableRows[0]?.campaignTitle).toBe('Campaign campaign-1');
	});

	test('ignores a contributor outside the operated programs', async () => {
		mockGetContributorFilterOption.mockResolvedValue({ success: true, data: null });

		const data = expectSuccess(await getPaginatedTableView('user-1', query));

		expect(mockFindContributionTableSource).toHaveBeenCalledWith(expect.objectContaining({ contributorId: undefined }));
		expect(data.filterOptions.contributors).toEqual([]);
	});

	test('returns no contributions without operator access', async () => {
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [{ programId: 'program-1', programName: 'Program 1', permission: ProgramPermission.owner }],
		});

		const data = expectSuccess(await getPaginatedTableView('user-1', query));

		expect(data.tableRows).toEqual([]);
		expect(mockGetContributorFilterOption).not.toHaveBeenCalled();
		expect(mockFindContributionTableSource).not.toHaveBeenCalled();
	});
});
