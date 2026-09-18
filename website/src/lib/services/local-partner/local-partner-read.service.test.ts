import { type PrismaClient } from '@/generated/prisma/client';
import type { ServiceResult } from '../core/base.types';
import { LocalPartnerReadService } from './local-partner-read.service';
import type { PublicProgramLocalPartner } from './local-partner.types';

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

const createService = (localPartners: PublicProgramLocalPartner[] = []) => {
	const findMany = jest.fn().mockResolvedValue(localPartners);
	const db = {
		localPartner: { findMany },
	};
	const service = new LocalPartnerReadService(db as unknown as PrismaClient, {} as never);

	return { service, findMany };
};

describe('LocalPartnerReadService public program local partners', () => {
	test('returns every local partner with recipients in the program', async () => {
		const localPartners = [
			{ id: 'partner-1', name: 'Aurora Foundation', slug: 'aurora-foundation' },
			{ id: 'partner-2', name: 'SLAES', slug: 'slaes' },
		];
		const { service, findMany } = createService(localPartners);

		const result = await service.getPublicLocalPartnersByProgramId(' program-1 ');

		expect(expectSuccess(result)).toEqual(localPartners);
		expect(findMany).toHaveBeenCalledWith({
			where: {
				recipients: {
					some: { programId: 'program-1' },
				},
			},
			select: {
				id: true,
				name: true,
				slug: true,
			},
			orderBy: { name: 'asc' },
		});
	});

	test('returns an empty list when no local partners have recipients in the program', async () => {
		const { service } = createService();

		const result = await service.getPublicLocalPartnersByProgramId('program-1');

		expect(expectSuccess(result)).toEqual([]);
	});

	test('rejects a blank program id without querying the database', async () => {
		const { service, findMany } = createService();

		const result = await service.getPublicLocalPartnersByProgramId('   ');

		expectFailure(result, 'Missing program id');
		expect(findMany).not.toHaveBeenCalled();
	});
});
