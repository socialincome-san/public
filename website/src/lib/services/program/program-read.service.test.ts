import { type PrismaClient } from '@/generated/prisma/client';
import type { ServiceResult } from '../core/base.types';
import { ProgramReadService } from './program-read.service';
import type { PublicProgramTargetFocus } from './program.types';

jest.mock('@/generated/prisma/client', () => ({
	PayoutStatus: {
		paid: 'paid',
		confirmed: 'confirmed',
	},
	PrismaClient: class {},
	ProgramPermission: {},
	SurveyStatus: {},
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

const createService = (targetFocuses: { focus: PublicProgramTargetFocus }[] = []) => {
	const findMany = jest.fn().mockResolvedValue(targetFocuses);
	const db = {
		programTargetFocus: { findMany },
	};
	const service = new ProgramReadService(db as unknown as PrismaClient, {} as never, {} as never);

	return { service, findMany };
};

describe('ProgramReadService public target focuses', () => {
	test('returns every target focus for a program', async () => {
		const targetFocuses = [
			{ focus: { id: 'focus-poverty', slug: 'poverty', name: 'Poverty' } },
			{ focus: { id: 'focus-health', slug: 'health', name: 'Health' } },
		];
		const { service, findMany } = createService(targetFocuses);

		const result = await service.getPublicTargetFocusesByProgramId(' program-1 ');

		expect(expectSuccess(result)).toEqual(targetFocuses.map(({ focus }) => focus));
		expect(findMany).toHaveBeenCalledWith({
			where: { programId: 'program-1' },
			select: {
				focus: {
					select: {
						id: true,
						slug: true,
						name: true,
					},
				},
			},
		});
	});

	test('returns an empty list when the program has no target focuses', async () => {
		const { service } = createService();

		const result = await service.getPublicTargetFocusesByProgramId('program-1');

		expect(expectSuccess(result)).toEqual([]);
	});

	test('rejects a blank program id without querying the database', async () => {
		const { service, findMany } = createService();

		const result = await service.getPublicTargetFocusesByProgramId('   ');

		expectFailure(result, 'Missing program id');
		expect(findMany).not.toHaveBeenCalled();
	});
});
