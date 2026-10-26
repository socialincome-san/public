import { UserRole } from '@/generated/prisma/enums';
import type { Result } from '@/lib/result';
import type { UserSession } from '@/modules/users/user.types';
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

jest.mock('./focus.repository.read', () => ({
	findFocusById: mockFindFocusById,
	findPaginatedFocuses: mockFindPaginatedFocuses,
	findFocusOptions: mockFindFocusOptions,
	findFocusStatsBySlugs: mockFindFocusStatsBySlugs,
	findFocusByName: mockFindFocusByName,
	findFocusBySlug: mockFindFocusBySlug,
	findFocusForDeletion: mockFindFocusForDeletion,
}));

jest.mock('./focus.repository.write', () => ({
	createFocus: mockCreateFocus,
	updateFocus: mockUpdateFocus,
	deleteFocus: mockDeleteFocus,
}));

import { deleteFocus, getPaginatedFocusTableView, getPublicFocusStatsBySlugs } from './focus.service';

const expectSuccess = <T>(result: Result<T>): T => {
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

describe('focus write attribution', () => {
	const admin: UserSession = {
		type: 'user',
		id: 'admin-1',
		gender: null,
		email: null,
		firstName: 'Max',
		lastName: 'Admin',
		language: null,
		street: null,
		number: null,
		city: null,
		zip: null,
		country: null,
		role: UserRole.admin,
		activeOrganization: null,
		organizations: [],
		programs: [],
		hasAnyOperatorProgramAccess: false,
	};

	test('attributes deletes to the admin', async () => {
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
		mockFindFocusForDeletion.mockResolvedValue({ id: 'entity-1', _count: { localPartners: 0, programs: 0 } });
		mockDeleteFocus.mockResolvedValue({ id: 'entity-1' });

		await deleteFocus(admin, 'entity-1');

		expect(mockDeleteFocus).toHaveBeenCalledWith(
			{ actor: { type: 'user', id: 'admin-1', name: 'Max Admin' }, source: 'portal' },
			'entity-1',
		);
	});
});
