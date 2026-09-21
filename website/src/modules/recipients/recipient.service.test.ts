import { PayoutInterval, PayoutStatus } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';
import { OBFUSCATED_SENTINEL } from '@/lib/utils/obfuscation';

const mockGetProgramNameById = jest.fn();
const mockFindPublicRecipientTableSource = jest.fn();
const mockFindUnassignedRecipientCountries = jest.fn();
const mockCountRecipientsForProgramsAndLocalPartners = jest.fn();
const mockCountCandidatesForLocalPartners = jest.fn();

jest.mock('./recipient.repository', () => ({
	findPublicRecipientTableSource: mockFindPublicRecipientTableSource,
	findUnassignedRecipientCountries: mockFindUnassignedRecipientCountries,
	countRecipientsForProgramsAndLocalPartners: mockCountRecipientsForProgramsAndLocalPartners,
	countCandidatesForLocalPartners: mockCountCandidatesForLocalPartners,
}));

jest.mock('@/integrations/firebase/firebase-auth.integration', () => ({}));
jest.mock('@/modules/local-partners/local-partner.service', () => ({
	getLocalPartnerOptions: jest.fn(),
}));
jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: jest.fn(),
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
	getPublicRecipientsTableView,
	getUnassignedRecipientCountries,
} from './recipient.service';

const expectSuccess = <T>(result: ServiceResult<T>): T => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const expectFailure = (result: ServiceResult<unknown>, error: string): void => {
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
