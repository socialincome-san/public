import { ProgramPermission, UserRole } from '@/generated/prisma/enums';
import type { Result } from '@/lib/result';
import type { UserSession } from '@/modules/users/user.types';

type DonationCertificateCreateInput = {
	year: number;
	language: string;
	storagePath: string;
	contributorId: string;
};

const mockIsFirebaseStorageConfigured = jest.fn();
const mockDownloadFirebaseStorageFile = jest.fn();
const mockUploadFileToFirebaseStorage = jest.fn();
const mockGetSucceededForContributorAndYear = jest.fn();
const mockGetContributorsByIds = jest.fn();
const mockGetContributorFilterOption = jest.fn();
const mockGetAccessiblePrograms = jest.fn();
const mockFindPaginatedDonationCertificates = jest.fn();
const mockFindDonationCertificateForPrograms = jest.fn();
const mockFindPaginatedContributorDonationCertificates = jest.fn();
const mockCreateDonationCertificate = jest.fn<Promise<void>, [unknown, DonationCertificateCreateInput]>();

jest.mock('@/integrations/firebase/firebase-storage.integration', () => ({
	downloadFirebaseStorageFile: mockDownloadFirebaseStorageFile,
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
	findDonationCertificateForPrograms: mockFindDonationCertificateForPrograms,
	findPaginatedDonationCertificates: mockFindPaginatedDonationCertificates,
	findPaginatedContributorDonationCertificates: mockFindPaginatedContributorDonationCertificates,
}));

jest.mock('./donation-certificate.repository.write', () => ({
	createDonationCertificate: mockCreateDonationCertificate,
}));

import {
	createDonationCertificateForContributor,
	createDonationCertificatesForUser,
	downloadDonationCertificateForUser,
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

const originalStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

describe('donation certificate service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-bucket';
		mockIsFirebaseStorageConfigured.mockReturnValue(true);
		mockCreateDonationCertificate.mockResolvedValue(undefined);
	});

	afterAll(() => {
		if (originalStorageBucket === undefined) {
			delete process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
		} else {
			process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = originalStorageBucket;
		}
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
						createdAt: new Date('2026-01-01T00:00:00.000Z'),
					},
				],
				totalCount: 1,
				contributorFilterOptions: [],
			},
		});
	});

	test('downloads a certificate only for a contributor in an operated program', async () => {
		const contents = Buffer.from('%PDF-1.7');
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [
				{ programId: 'operator-program', programName: 'Operator', permission: ProgramPermission.operator },
				{ programId: 'owner-program', programName: 'Owner', permission: ProgramPermission.owner },
			],
		});
		mockFindDonationCertificateForPrograms.mockResolvedValue({
			year: 2025,
			storagePath: 'users/auth-1/donation-certificates/2025_en.pdf',
		});
		mockDownloadFirebaseStorageFile.mockResolvedValue({ success: true, data: contents });

		const result = await downloadDonationCertificateForUser('user-1', 'certificate-1');

		expect(mockFindDonationCertificateForPrograms).toHaveBeenCalledWith('certificate-1', ['operator-program']);
		expect(mockDownloadFirebaseStorageFile).toHaveBeenCalledWith(
			'test-bucket',
			'users/auth-1/donation-certificates/2025_en.pdf',
		);
		expect(result).toEqual({
			success: true,
			data: { contents, filename: 'donation-certificate-2025.pdf' },
		});
	});

	test('does not download certificates outside operated programs', async () => {
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [{ programId: 'owner-program', programName: 'Owner', permission: ProgramPermission.owner }],
		});

		const result = await downloadDonationCertificateForUser('user-1', 'certificate-1');

		expectFailure(result, 'Donation certificate not found');
		expect(mockFindDonationCertificateForPrograms).not.toHaveBeenCalled();
		expect(mockDownloadFirebaseStorageFile).not.toHaveBeenCalled();
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
		mockGetSucceededForContributorAndYear.mockResolvedValue({ success: true, data: [] });

		const result = await createDonationCertificateForContributor(website, 2025, 'contributor-1');

		expectFailure(result, 'noContributions');
		expect(mockUploadFileToFirebaseStorage).not.toHaveBeenCalled();
		expect(mockCreateDonationCertificate).not.toHaveBeenCalled();
	});

	test('creates multiple certificates for the same year without replacing the existing file', async () => {
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
		mockGetSucceededForContributorAndYear.mockResolvedValue({
			success: true,
			data: [{ createdAt: new Date('2025-03-01T00:00:00.000Z'), amount: 50, currency: 'CHF' }],
		});
		mockUploadFileToFirebaseStorage.mockResolvedValue({ success: true, data: undefined });

		const firstResult = await createDonationCertificateForContributor(website, 2025, 'contributor-1', 'en');
		const secondResult = await createDonationCertificateForContributor(website, 2025, 'contributor-1', 'en');

		expect(firstResult.success).toBe(true);
		expect(secondResult.success).toBe(true);
		expect(mockCreateDonationCertificate).toHaveBeenCalledTimes(2);
		const storagePaths = mockCreateDonationCertificate.mock.calls.map(([, input]) => input.storagePath);
		for (const storagePath of storagePaths) {
			expect(storagePath).toMatch(/^users\/auth-1\/donation-certificates\/2025_en_[\w-]+\.pdf$/);
		}
		expect(new Set(storagePaths).size).toBe(2);
		expect(mockGetSucceededForContributorAndYear).toHaveBeenCalledTimes(2);
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
		mockGetSucceededForContributorAndYear.mockResolvedValue({
			success: true,
			data: [{ createdAt: new Date('2025-03-01T00:00:00.000Z'), amount: 50, currency: 'CHF' }],
		});
		mockUploadFileToFirebaseStorage.mockResolvedValue({ success: true, data: undefined });

		await createDonationCertificatesForUser(operator, 2025, ['contributor-1']);

		expect(mockCreateDonationCertificate).toHaveBeenCalledTimes(1);
		const [audit, input] = mockCreateDonationCertificate.mock.calls[0];
		expect(audit).toEqual({ actor: { type: 'user', id: 'user-1', name: 'Max Operator' }, source: 'portal' });
		expect(input.year).toBe(2025);
		expect(input.language).toBe('en');
		expect(input.storagePath).toMatch(/^users\/auth-1\/donation-certificates\/2025_en_[\w-]+\.pdf$/);
		expect(input.contributorId).toBe('contributor-1');
	});
});
