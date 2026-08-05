import { type PrismaClient } from '@/generated/prisma/client';
import type { ServiceResult } from '../core/base.types';
import { ProgramPublicSubmissionService } from './program-public-submission.service';

jest.mock('@/generated/prisma/client', () => ({
	Prisma: {},
	PrismaClient: class {},
}));

const expectSuccess = <T>(result: ServiceResult<T>) => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const expectFailure = (result: ServiceResult<unknown>, error: string) => {
	expect(result.success).toBe(false);
	if (result.success) {
		throw new Error('Expected failure');
	}
	expect(result.error).toBe(error);
};

const createService = () => {
	const findMany = jest.fn();
	const findFirst = jest.fn();
	const db = {
		program: {
			findMany,
			findFirst,
		},
	};
	const logger = { error: jest.fn() };
	const service = new ProgramPublicSubmissionService(db as unknown as PrismaClient, logger as never);

	return { service, findMany, findFirst, logger };
};

describe('ProgramPublicSubmissionService', () => {
	describe('getEligibleProgramOptions', () => {
		test('maps country, recipient count, and focuses for matching published slugs', async () => {
			const { service, findMany } = createService();
			findMany.mockResolvedValue([
				{
					id: 'program-1',
					name: 'Core SL',
					slug: 'si-core-sl',
					countryId: 'country-sl',
					country: { isoCode: 'SL' },
					targetFocuses: [
						{ focus: { name: 'Poverty', slug: 'poverty' } },
						{ focus: { name: 'Health', slug: 'health' } },
					],
					_count: { recipients: 12 },
				},
			]);

			const data = expectSuccess(await service.getEligibleProgramOptions([' si-core-sl ', 'si-core-sl', '']));

			expect(findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						slug: { in: ['si-core-sl'] },
						recipients: { some: {} },
					},
				}),
			);
			expect(data).toEqual([
				{
					id: 'program-1',
					name: 'Core SL',
					slug: 'si-core-sl',
					countryId: 'country-sl',
					countryIsoCode: 'SL',
					recipientsCount: 12,
					focuses: [
						{ slug: 'poverty', name: 'Poverty' },
						{ slug: 'health', name: 'Health' },
					],
				},
			]);
		});

		test('short-circuits to an empty list when no published slugs remain', async () => {
			const { service, findMany } = createService();

			const data = expectSuccess(await service.getEligibleProgramOptions(['  ', '']));

			expect(data).toEqual([]);
			expect(findMany).not.toHaveBeenCalled();
		});

		test('returns a failure result when Prisma throws', async () => {
			const { service, findMany, logger } = createService();
			findMany.mockRejectedValue(new Error('db down'));

			const result = await service.getEligibleProgramOptions(['si-core-sl']);

			expectFailure(result, 'Could not load programs.');
			expect(logger.error).toHaveBeenCalled();
		});
	});

	describe('isProgramEligible', () => {
		test('returns false for blank program ids without querying', async () => {
			const { service, findFirst } = createService();

			const data = expectSuccess(await service.isProgramEligible('   ', ['si-core-sl']));

			expect(data).toBe(false);
			expect(findFirst).not.toHaveBeenCalled();
		});

		test('returns false when no published slugs remain', async () => {
			const { service, findFirst } = createService();

			const data = expectSuccess(await service.isProgramEligible('program-1', ['']));

			expect(data).toBe(false);
			expect(findFirst).not.toHaveBeenCalled();
		});

		test('returns true when an eligible program exists', async () => {
			const { service, findFirst } = createService();
			findFirst.mockResolvedValue({ id: 'program-1' });

			const data = expectSuccess(await service.isProgramEligible(' program-1 ', ['si-core-sl']));

			expect(data).toBe(true);
			expect(findFirst).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						id: 'program-1',
						slug: { in: ['si-core-sl'] },
						recipients: { some: {} },
					},
				}),
			);
		});
	});
});
