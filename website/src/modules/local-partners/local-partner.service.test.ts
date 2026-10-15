import type { Result } from '@/lib/result';

const mockFindPublicLocalPartnersByProgramId = jest.fn();
const mockIsAdmin = jest.fn();
const mockFindPaginatedLocalPartners = jest.fn();

jest.mock('@/modules/auth/auth.service', () => ({}));

jest.mock('./local-partner.repository.write', () => ({}));

jest.mock('./local-partner.repository.read', () => ({
	findPublicLocalPartnersByProgramId: mockFindPublicLocalPartnersByProgramId,
	findPaginatedLocalPartners: mockFindPaginatedLocalPartners,
}));

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
}));

import { getPaginatedLocalPartnerTableView, getPublicLocalPartnersByProgramId } from './local-partner.service';
import type { PublicProgramLocalPartner } from './local-partner.types';

const expectSuccess = <T>(result: Result<T>): T => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

describe('local partner service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
	});

	test('passes the focus filter to the local partner repository', async () => {
		const query = { page: 1, pageSize: 10, search: '', focusId: 'focus-1' };
		mockFindPaginatedLocalPartners.mockResolvedValue({ partners: [], totalCount: 0, assignedRecipientGroups: [] });

		await getPaginatedLocalPartnerTableView('admin-1', query);

		expect(mockFindPaginatedLocalPartners).toHaveBeenCalledWith(query);
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
