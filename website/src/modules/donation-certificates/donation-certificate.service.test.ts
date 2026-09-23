import { ProgramPermission } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';

const mockIsFirebaseStorageConfigured = jest.fn();
const mockUploadFileToFirebaseStorage = jest.fn();
const mockGetSucceededForContributorAndYear = jest.fn();
const mockGetContributorsByIds = jest.fn();
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
	getContributorsByIds: mockGetContributorsByIds,
}));

jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: mockGetAccessiblePrograms,
}));

jest.mock('./donation-certificate.repository', () => ({
	findPaginatedDonationCertificates: mockFindPaginatedDonationCertificates,
	findPaginatedContributorDonationCertificates: mockFindPaginatedContributorDonationCertificates,
	findDonationCertificateByYearAndLanguage: mockFindDonationCertificateByYearAndLanguage,
	createDonationCertificate: mockCreateDonationCertificate,
}));

import {
	createDonationCertificateForContributor,
	createDonationCertificatesForUser,
	getPaginatedDonationCertificates,
} from './donation-certificate.service';

const expectFailure = (result: ServiceResult<unknown>, error: string): void => {
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

		expect(mockFindPaginatedDonationCertificates).toHaveBeenCalledWith(['operator-program'], query);
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
			},
		});
	});

	test('rejects certificate generation when any selected contributor is outside user scope', async () => {
		mockGetContributorsByIds.mockResolvedValue({
			success: true,
			data: [{ id: 'contributor-1' }],
		});

		const result = await createDonationCertificatesForUser('user-1', 2025, ['contributor-1', 'contributor-2'], 'en');

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

		const result = await createDonationCertificateForContributor(2025, 'contributor-1');

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

		const result = await createDonationCertificateForContributor(2025, 'contributor-1', 'en');

		expectFailure(result, 'alreadyExists');
		expect(mockGetSucceededForContributorAndYear).not.toHaveBeenCalled();
	});
});
