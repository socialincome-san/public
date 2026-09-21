import type { ServiceResult } from '@/lib/service-result';

const mockFindPublicLocalPartnersByProgramId = jest.fn();
const mockIsAdmin = jest.fn();

jest.mock('@/integrations/firebase/firebase-auth.integration', () => ({}));

jest.mock('./local-partner.repository', () => ({
	findPublicLocalPartnersByProgramId: mockFindPublicLocalPartnersByProgramId,
}));

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
}));

import { getPublicLocalPartnersByProgramId } from './local-partner.service';
import type { PublicProgramLocalPartner } from './local-partner.types';

const expectSuccess = <T>(result: ServiceResult<T>): T => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

describe('local partner service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns every local partner with recipients in the program', async () => {
		const localPartners: PublicProgramLocalPartner[] = [
			{ id: 'partner-1', name: 'Aurora Foundation', slug: 'aurora-foundation' },
			{ id: 'partner-2', name: 'SLAES', slug: 'slaes' },
		];
		mockFindPublicLocalPartnersByProgramId.mockResolvedValue(localPartners);

		expect(expectSuccess(await getPublicLocalPartnersByProgramId(' program-1 '))).toEqual(localPartners);
		expect(mockFindPublicLocalPartnersByProgramId).toHaveBeenCalledWith('program-1');
	});

	test('rejects a blank program id without querying the repository', async () => {
		await expect(getPublicLocalPartnersByProgramId('   ')).resolves.toEqual({
			success: false,
			error: 'Missing program id',
			status: undefined,
		});
		expect(mockFindPublicLocalPartnersByProgramId).not.toHaveBeenCalled();
	});
});
