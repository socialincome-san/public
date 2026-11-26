const mockUserFindUnique = jest.fn();
const mockOrganizationAccessFindUnique = jest.fn();
const mockProgramAccessFindMany = jest.fn();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		user: {
			findUnique: mockUserFindUnique,
		},
		organizationAccess: {
			findUnique: mockOrganizationAccessFindUnique,
		},
		programAccess: {
			findMany: mockProgramAccessFindMany,
		},
	},
}));

import { findActiveOrganizationId, findOperatorProgramCountriesByUserId } from './program-access.repository';

describe('findActiveOrganizationId', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns null when the active organization pointer is stale after revocation', async () => {
		mockUserFindUnique.mockResolvedValue({ activeOrganizationId: 'org-a' });
		mockOrganizationAccessFindUnique.mockResolvedValue(null);

		await expect(findActiveOrganizationId('user-1')).resolves.toBeNull();
		expect(mockOrganizationAccessFindUnique).toHaveBeenCalledWith({
			where: {
				userId_organizationId: {
					userId: 'user-1',
					organizationId: 'org-a',
				},
			},
			select: { organizationId: true },
		});
	});

	test('returns the active organization when membership still exists', async () => {
		mockUserFindUnique.mockResolvedValue({ activeOrganizationId: 'org-a' });
		mockOrganizationAccessFindUnique.mockResolvedValue({ organizationId: 'org-a' });

		await expect(findActiveOrganizationId('user-1')).resolves.toBe('org-a');
	});

	test('finds operator programs across all organizations the user belongs to', async () => {
		await findOperatorProgramCountriesByUserId('user-1');

		expect(mockProgramAccessFindMany).toHaveBeenCalledWith({
			where: {
				permission: 'operator',
				organization: { organizationAccesses: { some: { userId: 'user-1' } } },
			},
			select: {
				program: {
					select: {
						country: { select: { isoCode: true } },
					},
				},
			},
		});
	});
});
