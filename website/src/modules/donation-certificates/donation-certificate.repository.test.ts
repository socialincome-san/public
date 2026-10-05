const mockFindMany = jest.fn();
const mockFindFirst = jest.fn();
const mockCount = jest.fn();
const mockCreateMany = jest.fn();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		donationCertificate: {
			findMany: mockFindMany,
			findFirst: mockFindFirst,
			count: mockCount,
			createMany: mockCreateMany,
		},
	},
}));

import {
	findDonationCertificateByYearAndLanguage,
	findPaginatedContributorDonationCertificates,
	findPaginatedDonationCertificates,
} from './donation-certificate.repository';

describe('donation certificate repository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFindMany.mockResolvedValue([]);
		mockFindFirst.mockResolvedValue(null);
		mockCount.mockResolvedValue(0);
	});

	test('scopes the management table and applies pagination with an explicit select', async () => {
		await findPaginatedDonationCertificates(['program-1'], {
			page: 2,
			pageSize: 25,
			search: '',
			sortBy: 'contributor',
			sortDirection: 'asc',
		});

		const where = {
			contributor: {
				contributions: {
					some: {
						campaign: {
							programId: {
								in: ['program-1'],
							},
						},
					},
				},
			},
		};
		expect(mockFindMany).toHaveBeenCalledWith({
			where,
			select: {
				id: true,
				year: true,
				storagePath: true,
				createdAt: true,
				contributor: {
					select: {
						id: true,
						contact: {
							select: {
								firstName: true,
								lastName: true,
								email: true,
							},
						},
					},
				},
			},
			orderBy: [{ contributor: { contact: { firstName: 'asc' } } }, { contributor: { contact: { lastName: 'asc' } } }],
			skip: 25,
			take: 25,
		});
		expect(mockCount).toHaveBeenCalledWith({ where });
	});

	test('searches the current contributor certificates by a numeric year', async () => {
		await findPaginatedContributorDonationCertificates('contributor-1', {
			page: 1,
			pageSize: 10,
			search: ' 2025 ',
		});

		const where = {
			AND: [
				{ contributorId: 'contributor-1' },
				{
					OR: [{ storagePath: { contains: '2025', mode: 'insensitive' } }, { year: 2025 }],
				},
			],
		};
		expect(mockFindMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where,
				orderBy: [{ createdAt: 'desc' }],
			}),
		);
		expect(mockCount).toHaveBeenCalledWith({ where });
	});

	test('selects only certificate fields when checking for an existing certificate', async () => {
		await findDonationCertificateByYearAndLanguage(2025, 'contributor-1', 'fr');

		expect(mockFindFirst).toHaveBeenCalledWith({
			where: {
				year: 2025,
				contributorId: 'contributor-1',
				language: 'fr',
			},
			select: {
				id: true,
				year: true,
				language: true,
				storagePath: true,
				contributorId: true,
				createdAt: true,
			},
		});
	});
});
