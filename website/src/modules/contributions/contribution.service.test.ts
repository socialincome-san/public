import type { ServiceResult } from '@/lib/service-result';
import type { GlobeContribution } from './contribution.types';

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

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		contribution: { findMany: mockFindMany },
	},
}));

jest.mock('@/lib/types/country', () => ({
	getCountryNameByCode: (code: string) => `Country(${code})`,
	isValidCountryCode: (code: string) => Boolean(code),
}));

jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: jest.fn(),
}));

jest.mock('@/modules/contributors/contributor.service', () => ({
	findContributorById: jest.fn(),
	getEditableContributorOptions: jest.fn(),
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

const expectSuccess = <T>(result: ServiceResult<T>) => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

let getRecentSuccessfulContributions: (cutoff: Date) => Promise<ServiceResult<GlobeContribution[]>>;

beforeAll(async () => {
	({ getRecentSuccessfulContributions } = await import('./contribution.service'));
});

describe('getRecentSuccessfulContributions', () => {
	const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

	beforeEach(() => {
		mockFindMany.mockReset();
		consoleWarn.mockClear();
	});

	afterAll(() => {
		consoleWarn.mockRestore();
	});

	const cutoff = new Date('2026-08-05T00:00:00.000Z');

	it('queries only succeeded contributions created at or after the cutoff', async () => {
		mockFindMany.mockResolvedValue([]);
		await getRecentSuccessfulContributions(cutoff);

		const { where } = getFindManyQuery();
		expect(where.status).toBe('succeeded');
		expect(where.createdAt).toEqual({ gte: cutoff });
	});

	it('orders by createdAt descending', async () => {
		mockFindMany.mockResolvedValue([]);
		await getRecentSuccessfulContributions(cutoff);

		expect(getFindManyQuery().orderBy).toEqual({ createdAt: 'desc' });
	});

	it('caps the public contribution payload', async () => {
		mockFindMany.mockResolvedValue([]);
		await getRecentSuccessfulContributions(cutoff);

		expect(getFindManyQuery().take).toBe(200);
	});

	it('selects only the public globe fields', async () => {
		mockFindMany.mockResolvedValue([]);
		await getRecentSuccessfulContributions(cutoff);

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
		await getRecentSuccessfulContributions(cutoff);

		const { select } = getFindManyQuery();

		expect(select).toHaveProperty('contributor');
	});

	it('maps a database row to the public GlobeContribution DTO', async () => {
		mockFindMany.mockResolvedValue([makeRow()]);
		const contributions = expectSuccess(await getRecentSuccessfulContributions(cutoff));

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
		const contributions = expectSuccess(await getRecentSuccessfulContributions(cutoff));

		expect(contributions).toHaveLength(1);
		expect(contributions[0]?.key).toBe('contribution-0');
		expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('Skipped 1'));
	});

	it('excludes contributions with no address at all', async () => {
		mockFindMany.mockResolvedValue([makeRow({ contributor: { contact: { address: null } } })]);
		const contributions = expectSuccess(await getRecentSuccessfulContributions(cutoff));

		expect(contributions).toHaveLength(0);
		expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('Skipped 1'));
	});

	it('returns an empty array without error when no contributions exist', async () => {
		mockFindMany.mockResolvedValue([]);
		const contributions = expectSuccess(await getRecentSuccessfulContributions(cutoff));

		expect(contributions).toEqual([]);
	});

	it('returns a service failure when the database throws', async () => {
		mockFindMany.mockRejectedValue(new Error('DB unavailable'));
		const result = await getRecentSuccessfulContributions(cutoff);

		expect(result.success).toBe(false);
	});

	it('does not expose contributor ID in the DTO', async () => {
		mockFindMany.mockResolvedValue([makeRow()]);
		const contributions = expectSuccess(await getRecentSuccessfulContributions(cutoff));

		const dto = contributions[0] as Record<string, unknown>;
		expect(dto).not.toHaveProperty('id');
		expect(dto).not.toHaveProperty('contributorId');
		expect(dto).not.toHaveProperty('email');
		expect(dto).not.toHaveProperty('firstName');
		expect(dto).not.toHaveProperty('lastName');
	});
});
