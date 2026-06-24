import { type PrismaClient } from '@/generated/prisma/client';
import type { ServiceResult } from '../core/base.types';
import { FocusReadService } from './focus-read.service';
import type { PublicFocusStatsBySlugMap } from './focus.types';

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

const createService = ({
	focuses = [
		{
			id: 'focus-health',
			slug: 'health',
			programs: [
				{ programId: 'program-1', program: { country: { isoCode: 'KE' } } },
				{ programId: 'program-1', program: { country: { isoCode: 'KE' } } },
				{ programId: 'program-2', program: { country: { isoCode: 'SL' } } },
			],
		},
	],
	recipientsInProgramsCount = 7,
	candidatesCount = 3,
}: {
	focuses?: { id: string; slug: string; programs: { programId: string; program?: { country: { isoCode: string } } }[] }[];
	recipientsInProgramsCount?: number;
	candidatesCount?: number;
} = {}) => {
	const findMany = jest.fn().mockResolvedValue(focuses);
	const count = jest.fn().mockResolvedValueOnce(recipientsInProgramsCount).mockResolvedValueOnce(candidatesCount);
	const db = {
		focus: { findMany },
		recipient: { count },
	};
	const service = new FocusReadService(db as unknown as PrismaClient, {} as never);

	return { service, findMany, count };
};

describe('FocusReadService public focus stats', () => {
	test('getPublicFocusStatsBySlugs returns slug-keyed stats with deduplicated program counts', async () => {
		const { service, findMany, count } = createService();

		const result = await service.getPublicFocusStatsBySlugs(['health', ' health ', '', 'missing']);
		const data = expectSuccess<PublicFocusStatsBySlugMap>(result);

		expect(findMany).toHaveBeenCalledWith({
			where: { slug: { in: ['health', 'missing'] } },
			select: {
				id: true,
				slug: true,
				programs: {
					select: {
						programId: true,
						program: { select: { country: { select: { isoCode: true } } } },
					},
				},
			},
		});
		expect(data).toEqual({
			health: {
				programsCount: 2,
				recipientsInProgramsCount: 7,
				candidatesCount: 3,
				countryIsoCodes: ['KE', 'SL'],
			},
		});
		expect(count).toHaveBeenCalledWith({
			where: {
				programId: { in: ['program-1', 'program-2'] },
			},
		});
		expect(count).toHaveBeenCalledWith({
			where: {
				programId: null,
				localPartner: {
					focuses: {
						some: {
							focusId: 'focus-health',
						},
					},
				},
			},
		});
	});

	test('getPublicFocusStatsBySlugs omits missing database focuses', async () => {
		const { service, count } = createService({ focuses: [] });

		const result = await service.getPublicFocusStatsBySlugs(['missing']);
		const data = expectSuccess<PublicFocusStatsBySlugMap>(result);

		expect(data).toEqual({});
		expect(count).not.toHaveBeenCalled();
	});
});
