import type { ServiceResult } from '@/lib/services/core/base.types';
import type { GlobeContribution } from './contribution-globe.types';

jest.mock('@/generated/prisma/client', () => ({
	ContributionStatus: { succeeded: 'succeeded' },
	PrismaClient: class {},
}));

jest.mock('@/lib/utils/logger', () => ({
	logger: { error: jest.fn(), warn: jest.fn() },
}));

jest.mock('@/lib/types/country', () => ({
	getCountryNameByCode: (code: string) => `Country(${code})`,
}));

const mockFindMany = jest.fn();
const mockDb = {
	contribution: { findMany: mockFindMany },
} as never;

const expectSuccess = <T>(result: ServiceResult<T>) => {
	expect(result.success).toBe(true);
	if (!result.success) throw new Error(result.error);
	return result.data;
};

// Import after mocks are in place.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let ContributionReadService: typeof import('./contribution-read.service').ContributionReadService;

beforeAll(async () => {
	({ ContributionReadService } = await import('./contribution-read.service'));
});

describe('ContributionReadService.getRecentSuccessfulContributions', () => {
	beforeEach(() => {
		mockFindMany.mockReset();
	});

	const cutoff = new Date('2026-08-05T00:00:00.000Z');

	const makeRow = (overrides: Record<string, unknown> = {}) => ({
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

	it('queries only succeeded contributions created at or after the cutoff', async () => {
		mockFindMany.mockResolvedValue([]);
		const service = new ContributionReadService(mockDb, {} as never);
		await service.getRecentSuccessfulContributions(cutoff);

		expect(mockFindMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					status: 'succeeded',
					createdAt: { gte: cutoff },
				}),
			}),
		);
	});

	it('orders by createdAt descending', async () => {
		mockFindMany.mockResolvedValue([]);
		const service = new ContributionReadService(mockDb, {} as never);
		await service.getRecentSuccessfulContributions(cutoff);

		expect(mockFindMany).toHaveBeenCalledWith(
			expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
		);
	});

	it('selects only the required fields — no names, emails, or payment references', async () => {
		mockFindMany.mockResolvedValue([]);
		const service = new ContributionReadService(mockDb, {} as never);
		await service.getRecentSuccessfulContributions(cutoff);

		const [call] = mockFindMany.mock.calls;
		const select = (call as [{ select: Record<string, unknown> }])[0].select;

		expect(select).toHaveProperty('id', true);
		expect(select).toHaveProperty('amount', true);
		expect(select).toHaveProperty('currency', true);
		expect(select).toHaveProperty('createdAt', true);
		expect(select).not.toHaveProperty('amountChf');
		expect(select).not.toHaveProperty('feesChf');
		expect(select).not.toHaveProperty('legacyFirestoreId');
	});

	it('loads the country through contributor → contact → address', async () => {
		mockFindMany.mockResolvedValue([]);
		const service = new ContributionReadService(mockDb, {} as never);
		await service.getRecentSuccessfulContributions(cutoff);

		const [call] = mockFindMany.mock.calls;
		const select = (call as [{ select: Record<string, unknown> }])[0].select;

		expect(select).toHaveProperty('contributor');
	});

	it('maps a database row to the public GlobeContribution DTO', async () => {
		mockFindMany.mockResolvedValue([makeRow()]);
		const service = new ContributionReadService(mockDb, {} as never);
		const contributions = expectSuccess(await service.getRecentSuccessfulContributions(cutoff));

		expect(contributions).toHaveLength(1);
		const dto = contributions[0] as GlobeContribution;
		expect(dto.key).toBe('cid-1');
		expect(dto.amount).toBe(42);
		expect(dto.currency).toBe('CHF');
		expect(dto.contributedAt).toBe('2026-08-10T14:32:00.000Z');
		expect(dto.countryCode).toBe('CH');
		expect(dto.countryName).toBe('Country(CH)');
	});

	it('excludes contributions without a country and logs the skipped count', async () => {
		const { logger } = await import('@/lib/utils/logger');
		mockFindMany.mockResolvedValue([
			makeRow({ contributor: { contact: { address: { country: null } } } }),
			makeRow({ id: 'cid-2' }),
		]);
		const service = new ContributionReadService(mockDb, {} as never);
		const contributions = expectSuccess(await service.getRecentSuccessfulContributions(cutoff));

		expect(contributions).toHaveLength(1);
		expect(contributions[0]?.key).toBe('cid-2');
		expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Skipped 1'));
	});

	it('excludes contributions with no address at all', async () => {
		mockFindMany.mockResolvedValue([
			makeRow({ contributor: { contact: { address: null } } }),
		]);
		const service = new ContributionReadService(mockDb, {} as never);
		const contributions = expectSuccess(await service.getRecentSuccessfulContributions(cutoff));

		expect(contributions).toHaveLength(0);
	});

	it('returns an empty array without error when no contributions exist', async () => {
		mockFindMany.mockResolvedValue([]);
		const service = new ContributionReadService(mockDb, {} as never);
		const contributions = expectSuccess(await service.getRecentSuccessfulContributions(cutoff));

		expect(contributions).toEqual([]);
	});

	it('returns a service failure when the database throws', async () => {
		mockFindMany.mockRejectedValue(new Error('DB unavailable'));
		const service = new ContributionReadService(mockDb, {} as never);
		const result = await service.getRecentSuccessfulContributions(cutoff);

		expect(result.success).toBe(false);
	});

	it('does not expose contributor ID in the DTO', async () => {
		mockFindMany.mockResolvedValue([makeRow()]);
		const service = new ContributionReadService(mockDb, {} as never);
		const contributions = expectSuccess(await service.getRecentSuccessfulContributions(cutoff));

		const dto = contributions[0] as Record<string, unknown>;
		expect(dto).not.toHaveProperty('contributorId');
		expect(dto).not.toHaveProperty('email');
		expect(dto).not.toHaveProperty('firstName');
		expect(dto).not.toHaveProperty('lastName');
	});
});
