import { PayoutInterval, PayoutStatus, ProgramPermission } from '@/generated/prisma/enums';
import type { Result } from '@/lib/result';
import { OBFUSCATED_SENTINEL } from './recipient.types';

const mockGetProgramNameById = jest.fn();
const mockFindPublicRecipientTableSource = jest.fn();
const mockFindUnassignedRecipientCountries = jest.fn();
const mockCountRecipientsForProgramsAndLocalPartners = jest.fn();
const mockCountCandidatesForLocalPartners = jest.fn();
const mockFindRecipientTableSource = jest.fn();
const mockGetLocalPartnerOptions = jest.fn();
const mockGetLocalPartnerFilterOption = jest.fn();
const mockGetAccessiblePrograms = jest.fn();

jest.mock('./recipient.repository.read', () => ({
	findPublicRecipientTableSource: mockFindPublicRecipientTableSource,
	findUnassignedRecipientCountries: mockFindUnassignedRecipientCountries,
	countRecipientsForProgramsAndLocalPartners: mockCountRecipientsForProgramsAndLocalPartners,
	countCandidatesForLocalPartners: mockCountCandidatesForLocalPartners,
	findRecipientTableSource: mockFindRecipientTableSource,
}));

jest.mock('@/modules/auth/auth.service', () => ({}));
jest.mock('./recipient.repository.write', () => ({}));
jest.mock('@/modules/users/user.service', () => ({
	isAdmin: jest.fn(),
}));
jest.mock('@/modules/local-partners/local-partner.service', () => ({
	getLocalPartnerFilterOption: mockGetLocalPartnerFilterOption,
	getLocalPartnerOptions: mockGetLocalPartnerOptions,
}));
jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: mockGetAccessiblePrograms,
}));
jest.mock('@/modules/programs/program-reference.service', () => ({
	getProgramNameById: mockGetProgramNameById,
}));
jest.mock('@/lib/utils/now', () => ({
	now: () => new Date('2025-06-15T12:00:00.000Z'),
}));

import {
	countCandidatesForLocalPartners,
	countRecipientsForProgramsAndLocalPartners,
	getPaginatedRecipientTableView,
	getPublicRecipientsTableView,
	getUnassignedRecipientCountries,
} from './recipient.service';

const expectSuccess = <T>(result: Result<T>): T => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const expectFailure = (result: Result<unknown>, error: string): void => {
	expect(result.success).toBe(false);
	if (result.success) {
		throw new Error('Expected failure');
	}

	expect(result.error).toBe(error);
};

const recipient = {
	startDate: new Date('2025-01-01T00:00:00.000Z'),
	suspendedAt: null,
	createdAt: new Date('2025-01-01T00:00:00.000Z'),
	contact: {
		dateOfBirth: new Date('1990-05-15T00:00:00.000Z'),
		address: { country: 'SL' },
	},
	program: {
		programDurationInMonths: 12,
		payoutInterval: PayoutInterval.monthly,
	},
	localPartner: {
		name: 'Partner A',
		contact: { address: { country: 'SL' } },
	},
	payouts: [{ status: PayoutStatus.paid }],
};

describe('getPaginatedRecipientTableView local partner filter', () => {
	const query = { page: 1, pageSize: 10, search: '' };

	beforeEach(() => {
		jest.clearAllMocks();
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [{ programId: 'program-1', programName: 'Program 1', permission: ProgramPermission.operator }],
		});
		mockFindRecipientTableSource.mockResolvedValue({ recipients: [], totalCount: 0 });
	});

	test('filters by an accessible local partner and offers it as filter option', async () => {
		mockGetLocalPartnerFilterOption.mockResolvedValue({ success: true, data: { id: 'partner-1', name: 'Partner A' } });

		const data = expectSuccess(await getPaginatedRecipientTableView('user-1', { ...query, localPartnerId: 'partner-1' }));

		expect(mockFindRecipientTableSource).toHaveBeenCalledWith(
			expect.objectContaining({ programIds: ['program-1'], localPartnerId: 'partner-1' }),
		);
		expect(mockGetLocalPartnerFilterOption).toHaveBeenCalledWith('partner-1', ['program-1']);
		expect(data.localPartnerFilterOptions).toEqual([{ id: 'partner-1', name: 'Partner A' }]);
	});

	test('ignores a local partner without recipients in the accessible programs', async () => {
		mockGetLocalPartnerFilterOption.mockResolvedValue({ success: true, data: null });

		const data = expectSuccess(
			await getPaginatedRecipientTableView('user-1', { ...query, localPartnerId: 'partner-unknown' }),
		);

		expect(mockFindRecipientTableSource).toHaveBeenCalledWith(expect.objectContaining({ localPartnerId: undefined }));
		expect(data.localPartnerFilterOptions).toEqual([]);
	});

	test('offers no local partner options without a linked filter', async () => {
		const data = expectSuccess(await getPaginatedRecipientTableView('user-1', query));

		expect(mockGetLocalPartnerFilterOption).not.toHaveBeenCalled();
		expect(data.localPartnerFilterOptions).toEqual([]);
	});

	test('sorts payment codes naturally before paginating', async () => {
		const makeRecipient = (id: string, paymentCode: string) => ({
			...recipient,
			id,
			paymentInformation: { code: paymentCode },
			contact: { ...recipient.contact, firstName: id, lastName: '' },
			program: { ...recipient.program, id: 'program-1', name: 'Program 1' },
		});
		mockFindRecipientTableSource.mockResolvedValue({
			recipients: [makeRecipient('ten', '10'), makeRecipient('two', '2'), makeRecipient('one', '1')],
			totalCount: 3,
		});

		const data = expectSuccess(
			await getPaginatedRecipientTableView('user-1', {
				...query,
				pageSize: 2,
				sortBy: 'paymentCode',
				sortDirection: 'asc',
			}),
		);

		expect(mockFindRecipientTableSource).toHaveBeenCalledWith(expect.objectContaining({ paginate: false }));
		expect(data.tableRows.map(({ paymentCode }) => paymentCode)).toEqual(['1', '2']);
		expect(data.totalCount).toBe(3);
	});
});

describe('recipient public table view', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetProgramNameById.mockResolvedValue({ success: true, data: 'Program' });
		mockFindPublicRecipientTableSource.mockResolvedValue({
			recipients: [recipient],
			totalCount: 1,
		});
	});

	test('returns program not found when the program is missing', async () => {
		mockGetProgramNameById.mockResolvedValue({ success: false, error: 'Program not found' });

		const result = await getPublicRecipientsTableView('missing-program');

		expectFailure(result, 'Program not found');
		expect(mockFindPublicRecipientTableSource).not.toHaveBeenCalled();
	});

	test('returns an empty table for a program without recipients', async () => {
		mockFindPublicRecipientTableSource.mockResolvedValue({ recipients: [], totalCount: 0 });

		const result = await getPublicRecipientsTableView('program-1');

		expect(expectSuccess(result)).toEqual({ tableRows: [], totalCount: 0 });
	});

	test('obfuscates recipient identity and excludes private fields', async () => {
		const result = await getPublicRecipientsTableView('program-1');
		const row = expectSuccess(result).tableRows[0];

		expect(row).toMatchObject({
			firstName: OBFUSCATED_SENTINEL,
			lastName: '',
			dateOfBirth: OBFUSCATED_SENTINEL,
		});
		expect(row).not.toHaveProperty('id');
		expect(row).not.toHaveProperty('paymentCode');
		expect(row).not.toHaveProperty('programId');
	});

	test('caps fetched rows while preserving the total count', async () => {
		mockFindPublicRecipientTableSource.mockResolvedValue({
			recipients: [recipient],
			totalCount: 1001,
		});

		const result = await getPublicRecipientsTableView('program-1');

		expect(expectSuccess(result).totalCount).toBe(1001);
		expect(mockFindPublicRecipientTableSource).toHaveBeenCalledWith('program-1', 1000);
	});
});

describe('recipient statistics', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('maps unassigned recipient countries to a module DTO', async () => {
		mockFindUnassignedRecipientCountries.mockResolvedValue([
			{
				contact: { address: { country: 'SL' } },
				localPartner: { contact: { address: { country: 'KE' } } },
			},
			{
				contact: null,
				localPartner: null,
			},
		]);

		expect(expectSuccess(await getUnassignedRecipientCountries())).toEqual([
			{ contactCountry: 'SL', localPartnerCountry: 'KE' },
			{ contactCountry: null, localPartnerCountry: null },
		]);
	});

	test('returns recipient and candidate counts', async () => {
		mockCountRecipientsForProgramsAndLocalPartners.mockResolvedValue(7);
		mockCountCandidatesForLocalPartners.mockResolvedValue(3);

		expect(expectSuccess(await countRecipientsForProgramsAndLocalPartners(['program-1'], ['partner-1']))).toBe(7);
		expect(expectSuccess(await countCandidatesForLocalPartners(['partner-1']))).toBe(3);
	});
});
