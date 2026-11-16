import type { Result } from '@/lib/result';

const mockFindPublicLocalPartnersByProgramId = jest.fn();
const mockIsAdmin = jest.fn();
const mockFindPaginatedLocalPartners = jest.fn();
const mockFindLocalPartnersBySlugs = jest.fn();
const mockFindLocalPartnerOptions = jest.fn();
const mockFindLocalPartnerIds = jest.fn();
const mockGroupRecipientCountsByLocalPartner = jest.fn();
const mockFindLocalPartnerIdsInRunningPrograms = jest.fn();

jest.mock('@/modules/auth/auth.service', () => ({}));

jest.mock('./local-partner.repository.write', () => ({}));

jest.mock('./local-partner.repository.read', () => ({
	findPublicLocalPartnersByProgramId: mockFindPublicLocalPartnersByProgramId,
	findPaginatedLocalPartners: mockFindPaginatedLocalPartners,
	findLocalPartnersBySlugs: mockFindLocalPartnersBySlugs,
	findLocalPartnerOptions: mockFindLocalPartnerOptions,
	findLocalPartnerIds: mockFindLocalPartnerIds,
	groupRecipientCountsByLocalPartner: mockGroupRecipientCountsByLocalPartner,
	findLocalPartnerIdsInRunningPrograms: mockFindLocalPartnerIdsInRunningPrograms,
}));

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
}));

import {
	getCandidatesByLocalPartnerSlug,
	getPaginatedLocalPartnerTableView,
	getPublicLocalPartnersByProgramId,
} from './local-partner.service';
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

	describe('getCandidatesByLocalPartnerSlug', () => {
		const mockPartnerCandidates = (partners: { id: string; slug: string; candidates: number }[]) => {
			mockFindLocalPartnersBySlugs.mockResolvedValue(partners.map(({ id, slug }) => ({ id, slug })));
			mockFindLocalPartnerOptions.mockResolvedValue(partners.map(({ id }) => ({ id, name: id })));
			mockFindLocalPartnerIds.mockResolvedValue(partners.map(({ id }) => ({ id })));
			mockFindLocalPartnerIdsInRunningPrograms.mockResolvedValue([]);
			mockGroupRecipientCountsByLocalPartner.mockImplementation((_ids: string[], assigned: boolean) =>
				Promise.resolve(
					assigned
						? []
						: partners
								.filter(({ candidates }) => candidates > 0)
								.map(({ id, candidates }) => ({
									localPartnerId: id,
									_count: { _all: candidates },
								})),
				),
			);
		};

		test('returns the partner candidates when the partner has some', async () => {
			mockPartnerCandidates([
				{ id: 'partner-1', slug: 'aurora', candidates: 4 },
				{ id: 'partner-2', slug: 'slaes', candidates: 10 },
			]);

			expect(expectSuccess(await getCandidatesByLocalPartnerSlug(' aurora '))).toEqual({ count: 4, isPartnerScoped: true });
			expect(mockFindLocalPartnersBySlugs).toHaveBeenCalledWith(['aurora']);
		});

		test('falls back to the candidates of all partners when the partner has none', async () => {
			mockPartnerCandidates([
				{ id: 'partner-1', slug: 'aurora', candidates: 0 },
				{ id: 'partner-2', slug: 'slaes', candidates: 10 },
			]);

			expect(expectSuccess(await getCandidatesByLocalPartnerSlug('aurora'))).toEqual({ count: 10, isPartnerScoped: false });
		});

		test('skips the partner lookup for a blank slug', async () => {
			mockPartnerCandidates([{ id: 'partner-2', slug: 'slaes', candidates: 10 }]);

			expect(expectSuccess(await getCandidatesByLocalPartnerSlug('   '))).toEqual({ count: 10, isPartnerScoped: false });
			expect(mockFindLocalPartnersBySlugs).not.toHaveBeenCalled();
		});

		test('fails when the database throws', async () => {
			jest.spyOn(console, 'error').mockImplementation(() => undefined);
			mockFindLocalPartnersBySlugs.mockRejectedValue(new Error('db down'));

			await expect(getCandidatesByLocalPartnerSlug('aurora')).resolves.toMatchObject({ success: false });
		});
	});
});
