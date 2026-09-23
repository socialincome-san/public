import type { ServiceResult } from '@/lib/service-result';
import type { PublicFocusStatsBySlugMap } from './focus.types';

const mockIsAdmin = jest.fn();
const mockFindFocusById = jest.fn();
const mockFindPaginatedFocuses = jest.fn();
const mockFindFocusOptions = jest.fn();
const mockFindFocusStatsBySlugs = jest.fn();
const mockCountRecipientsInProgramsForPartners = jest.fn();
const mockCountCandidatesForLocalPartners = jest.fn();
const mockFindFocusByName = jest.fn();
const mockFindFocusBySlug = jest.fn();
const mockCreateFocus = jest.fn();
const mockUpdateFocus = jest.fn();
const mockFindFocusForDeletion = jest.fn();
const mockDeleteFocus = jest.fn();

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
}));

jest.mock('@/modules/recipients/recipient.service', () => ({
	countRecipientsForProgramsAndLocalPartners: mockCountRecipientsInProgramsForPartners,
	countCandidatesForLocalPartners: mockCountCandidatesForLocalPartners,
}));

jest.mock('./focus.repository', () => ({
	findFocusById: mockFindFocusById,
	findPaginatedFocuses: mockFindPaginatedFocuses,
	findFocusOptions: mockFindFocusOptions,
	findFocusStatsBySlugs: mockFindFocusStatsBySlugs,
	findFocusByName: mockFindFocusByName,
	findFocusBySlug: mockFindFocusBySlug,
	createFocus: mockCreateFocus,
	updateFocus: mockUpdateFocus,
	findFocusForDeletion: mockFindFocusForDeletion,
	deleteFocus: mockDeleteFocus,
}));

import { getPaginatedFocusTableView, getPublicFocusStatsBySlugs } from './focus.service';

const expectSuccess = <T>(result: ServiceResult<T>): T => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

describe('focus service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
	});

	test('requires admin access for the focus table', async () => {
		mockIsAdmin.mockResolvedValue({ success: false, error: 'Permission denied' });

		const result = await getPaginatedFocusTableView('user-1', {
			page: 1,
			pageSize: 10,
			search: '',
		});

		expect(result).toEqual({
			success: false,
			error: 'Permission denied',
			status: undefined,
		});
		expect(mockFindPaginatedFocuses).not.toHaveBeenCalled();
	});

	test('returns slug-keyed public stats with deduplicated IDs', async () => {
		mockFindFocusStatsBySlugs.mockResolvedValue([
			{
				id: 'focus-health',
				slug: 'health',
				_count: { programs: 3 },
				programs: [
					{ programId: 'program-1', program: { country: { isoCode: 'KE' } } },
					{ programId: 'program-1', program: { country: { isoCode: 'KE' } } },
					{ programId: 'program-2', program: { country: { isoCode: 'SL' } } },
				],
				localPartners: [{ localPartnerId: 'partner-1' }, { localPartnerId: 'partner-2' }],
			},
		]);
		mockCountRecipientsInProgramsForPartners.mockResolvedValue({ success: true, data: 7 });
		mockCountCandidatesForLocalPartners.mockResolvedValue({ success: true, data: 3 });

		const data = expectSuccess<PublicFocusStatsBySlugMap>(
			await getPublicFocusStatsBySlugs(['health', ' health ', '', 'missing']),
		);

		expect(mockFindFocusStatsBySlugs).toHaveBeenCalledWith(['health', 'missing']);
		expect(mockCountRecipientsInProgramsForPartners).toHaveBeenCalledWith(
			['program-1', 'program-2'],
			['partner-1', 'partner-2'],
		);
		expect(data).toEqual({
			health: {
				programsCount: 3,
				recipientsInProgramsCount: 7,
				candidatesCount: 3,
				countryIsoCodes: ['KE', 'SL'],
			},
		});
	});
});
