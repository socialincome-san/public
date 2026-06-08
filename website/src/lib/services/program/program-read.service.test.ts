import type { PrismaClient } from '@/generated/prisma/client';
import type { ServiceResult } from '../core/base.types';
import type { ProgramAccessReadService } from '../program-access/program-access-read.service';
import type { ProgramStatsService } from '../program-stats/program-stats.service';
import { ProgramReadService } from './program-read.service';

jest.mock('@/generated/prisma/client', () => ({
	PayoutStatus: { confirmed: 'confirmed', paid: 'paid' },
	PrismaClient: class {},
	ProgramPermission: { operator: 'operator', owner: 'owner' },
	SurveyStatus: { completed: 'completed' },
}));
jest.mock('@/generated/prisma/enums', () => ({
	CountryCode: {},
}));

type MockProgramDelegate = {
	findMany: jest.Mock;
};

const expectSuccess = <T>(result: ServiceResult<T>) => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const createService = (programs: unknown[]) => {
	const findMany = jest.fn<Promise<unknown[]>, [unknown]>().mockResolvedValue(programs);
	const db = {
		program: {
			findMany,
		} satisfies MockProgramDelegate,
	};
	const service = new ProgramReadService(
		db as unknown as PrismaClient,
		{} as ProgramAccessReadService,
		{} as ProgramStatsService,
	);

	return { service, findMany };
};

describe('ProgramReadService program overview filters', () => {
	test('loads portal-slug keyed filter data for matched DB programs only', async () => {
		const { service, findMany } = createService([
			{
				id: 'program-alpha-id',
				slug: 'program-alpha',
				country: { isoCode: 'KE' },
				targetFocuses: [
					{ focus: { id: 'focus-health', slug: 'health' } },
					{ focus: { id: 'focus-education', slug: 'education' } },
				],
			},
		]);

		const result = await service.getPublicProgramFilterDataByPortalSlugs([
			' program-alpha ',
			'program-alpha',
			'',
			'program-missing',
		]);

		expect(findMany).toHaveBeenCalledWith({
			where: { slug: { in: ['program-alpha', 'program-missing'] } },
			select: {
				id: true,
				slug: true,
				country: {
					select: {
						isoCode: true,
					},
				},
				targetFocuses: {
					select: {
						focus: {
							select: {
								id: true,
								slug: true,
							},
						},
					},
				},
			},
		});
		expect(expectSuccess(result)).toEqual({
			'program-alpha': {
				programId: 'program-alpha-id',
				countryIsoCode: 'KE',
				focuses: [
					{ id: 'focus-health', slug: 'health' },
					{ id: 'focus-education', slug: 'education' },
				],
			},
		});
	});

	test('returns empty filter data when no portal slugs match', async () => {
		const { service } = createService([]);

		const result = await service.getPublicProgramFilterDataByPortalSlugs(['program-missing']);

		expect(expectSuccess(result)).toEqual({});
	});
});
