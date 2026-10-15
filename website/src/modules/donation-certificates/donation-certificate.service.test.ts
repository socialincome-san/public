import { ProgramPermission, UserRole } from '@/generated/prisma/enums';
import type { Result } from '@/lib/result';
import type { UserSession } from '@/modules/users/user.types';

const mockIsFirebaseStorageConfigured = jest.fn();
const mockUploadFileToFirebaseStorage = jest.fn();
const mockGetSucceededForContributorAndYear = jest.fn();
const mockGetContributorsByIds = jest.fn();
const mockGetContributorFilterOption = jest.fn();
const mockGetAccessiblePrograms = jest.fn();
const mockFindPaginatedDonationCertificates = jest.fn();
const mockFindPaginatedContributorDonationCertificates = jest.fn();
const mockFindDonationCertificateByYearAndLanguage = jest.fn();
const mockCreateDonationCertificate = jest.fn();

jest.mock('@/integrations/firebase/firebase-storage.integration', () => ({
	isFirebaseStorageConfigured: mockIsFirebaseStorageConfigured,
	uploadFileToFirebaseStorage: mockUploadFileToFirebaseStorage,
}));

jest.mock('@/modules/contributions/contribution.service', () => ({
	getSucceededForContributorAndYear: mockGetSucceededForContributorAndYear,
}));

jest.mock('@/modules/contributors/contributor.service', () => ({
	getContributorFilterOption: mockGetContributorFilterOption,
	getContributorsByIds: mockGetContributorsByIds,
}));

jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: mockGetAccessiblePrograms,
}));

jest.mock('./donation-certificate.repository.read', () => ({
	findPaginatedDonationCertificates: mockFindPaginatedDonationCertificates,
	findPaginatedContributorDonationCertificates: mockFindPaginatedContributorDonationCertificates,
	findDonationCertificateByYearAndLanguage: mockFindDonationCertificateByYearAndLanguage,
}));

jest.mock('./donation-certificate.repository.write', () => ({
	createDonationCertificate: mockCreateDonationCertificate,
}));

import {
	createDonationCertificateForContributor,
	createDonationCertificatesForUser,
	getPaginatedDonationCertificates,
} from './donation-certificate.service';

const website = {
	actor: { type: 'contributor' as const, id: 'contributor-1', name: 'Ada Lovelace' },
	source: 'website' as const,
};

const operator: UserSession = {
	type: 'user',
	id: 'user-1',
	gender: null,
	email: null,
	firstName: 'Max',
	lastName: 'Operator',
	language: null,
	street: null,
	number: null,
	city: null,
	zip: null,
	country: null,
	role: UserRole.user,
	activeOrganization: null,
	organizations: [],
	programs: [],
	hasAnyOperatorProgramAccess: true,
};

const expectFailure = (result: Result<unknown>, error: string): void => {
	expect(result.success).toBe(false);
	if (result.success) {
		throw new Error('Expected failure');
	}

	expect(result.error).toBe(error);
};

describe('donation certificate service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockIsFirebaseStorageConfigured.mockReturnValue(true);
	});

	test('limits the management table to programs with operator access', async () => {
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [
				{ programId: 'operator-program', programName: 'Operator', permission: ProgramPermission.operator },
				{ programId: 'owner-program', programName: 'Owner', permission: ProgramPermission.owner },
			],
		});
		mockFindPaginatedDonationCertificates.mockResolvedValue({
			certificates: [
				{
					id: 'certificate-1',
					year: 2025,
					storagePath: 'users/auth-1/donation-certificates/2025_en.pdf',
					createdAt: new Date('2026-01-01T00:00:00.000Z'),
					contributor: {
						id: 'contributor-1',
						contact: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.org' },
					},
				},
			],
			totalCount: 1,
		});
		const query = { page: 1, pageSize: 10, search: '' };

		const result = await getPaginatedDonationCertificates('user-1', query);

		expect(mockFindPaginatedDonationCertificates).toHaveBeenCalledWith(['operator-program'], undefined, query);
		expect(result).toEqual({
			success: true,
			data: {
				tableRows: [
					{
						id: 'certificate-1',
						year: 2025,
						contributorFirstName: 'Ada',
						contributorLastName: 'Lovelace',
						email: 'ada@example.org',
						storagePath: 'users/auth-1/donation-certificates/2025_en.pdf',
						createdAt: new Date('2026-01-01T00:00:00.000Z'),
					},
				],
				totalCount: 1,
				contributorFilterOptions: [],
			},
		});
	});

	test('filters by an accessible contributor and offers it as filter option', async () => {
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [{ programId: 'operator-program', programName: 'Operator', permission: ProgramPermission.operator }],
		});
		mockGetContributorFilterOption.mockResolvedValue({
			success: true,
			data: { id: 'contributor-1', name: 'Ada Lovelace' },
		});
		mockFindPaginatedDonationCertificates.mockResolvedValue({ certificates: [], totalCount: 0 });
		const query = { page: 1, pageSize: 10, search: '', contributorId: 'contributor-1' };

		const result = await getPaginatedDonationCertificates('user-1', query);

		expect(mockGetContributorFilterOption).toHaveBeenCalledWith('contributor-1', ['operator-program']);
		expect(mockFindPaginatedDonationCertificates).toHaveBeenCalledWith(['operator-program'], 'contributor-1', query);
		expect(result).toEqual({
			success: true,
			data: { tableRows: [], totalCount: 0, contributorFilterOptions: [{ id: 'contributor-1', name: 'Ada Lovelace' }] },
		});
	});

	test('ignores a contributor outside the operated programs', async () => {
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [{ programId: 'operator-program', programName: 'Operator', permission: ProgramPermission.operator }],
		});
		mockGetContributorFilterOption.mockResolvedValue({ success: true, data: null });
		mockFindPaginatedDonationCertificates.mockResolvedValue({ certificates: [], totalCount: 0 });
		const query = { page: 1, pageSize: 10, search: '', contributorId: 'contributor-other' };

		await getPaginatedDonationCertificates('user-1', query);

		expect(mockFindPaginatedDonationCertificates).toHaveBeenCalledWith(['operator-program'], undefined, query);
	});

	test('rejects certificate generation when any selected contributor is outside user scope', async () => {
		mockGetContributorsByIds.mockResolvedValue({
			success: true,
			data: [{ id: 'contributor-1' }],
		});

		const result = await createDonationCertificatesForUser(operator, 2025, ['contributor-1', 'contributor-2'], 'en');

		expectFailure(result, 'Permission denied');
		expect(mockFindDonationCertificateByYearAndLanguage).not.toHaveBeenCalled();
	});

	test('uses the contributor language and preserves the no-contributions failure', async () => {
		mockGetContributorsByIds.mockResolvedValue({
			success: true,
			data: [
				{
					id: 'contributor-1',
					firstName: 'Ada',
					lastName: 'Lovelace',
					email: 'ada@example.org',
					language: 'de',
					address: null,
					authId: 'auth-1',
				},
			],
		});
		mockFindDonationCertificateByYearAndLanguage.mockResolvedValue(null);
		mockGetSucceededForContributorAndYear.mockResolvedValue({ success: true, data: [] });

		const result = await createDonationCertificateForContributor(website, 2025, 'contributor-1');

		expect(mockFindDonationCertificateByYearAndLanguage).toHaveBeenCalledWith(2025, 'contributor-1', 'de');
		expectFailure(result, 'noContributions');
		expect(mockUploadFileToFirebaseStorage).not.toHaveBeenCalled();
		expect(mockCreateDonationCertificate).not.toHaveBeenCalled();
	});

	test('does not regenerate an existing year and language certificate', async () => {
		mockGetContributorsByIds.mockResolvedValue({
			success: true,
			data: [
				{
					id: 'contributor-1',
					firstName: 'Ada',
					lastName: 'Lovelace',
					email: 'ada@example.org',
					language: 'de',
					address: null,
					authId: 'auth-1',
				},
			],
		});
		mockFindDonationCertificateByYearAndLanguage.mockResolvedValue({ id: 'certificate-1' });

		const result = await createDonationCertificateForContributor(website, 2025, 'contributor-1', 'en');

		expectFailure(result, 'alreadyExists');
		expect(mockGetSucceededForContributorAndYear).not.toHaveBeenCalled();
	});

	test('attributes a generated certificate to the caller', async () => {
		mockGetContributorsByIds.mockResolvedValue({
			success: true,
			data: [
				{
					id: 'contributor-1',
					firstName: 'Ada',
					lastName: 'Lovelace',
					email: 'ada@example.org',
					language: 'en',
					address: null,
					authId: 'auth-1',
				},
			],
		});
		mockFindDonationCertificateByYearAndLanguage.mockResolvedValue(null);
		mockGetSucceededForContributorAndYear.mockResolvedValue({
			success: true,
			data: [{ createdAt: new Date('2025-03-01T00:00:00.000Z'), amount: 50, currency: 'CHF' }],
		});
		mockUploadFileToFirebaseStorage.mockResolvedValue({ success: true, data: undefined });

		await createDonationCertificatesForUser(operator, 2025, ['contributor-1']);

		expect(mockCreateDonationCertificate).toHaveBeenCalledWith(
			{ actor: { type: 'user', id: 'user-1', name: 'Max Operator' }, source: 'portal' },
			{
				year: 2025,
				language: 'en',
				storagePath: 'users/auth-1/donation-certificates/2025_en.pdf',
				contributorId: 'contributor-1',
			},
		);
	});
});
