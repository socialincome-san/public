const mockUserFindUnique = jest.fn();
const mockOrganizationAccessFindUnique = jest.fn();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		user: {
			findUnique: mockUserFindUnique,
		},
		organizationAccess: {
			findUnique: mockOrganizationAccessFindUnique,
		},
	},
}));

import { findActiveOrganizationId } from './program-access.repository';

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
});
