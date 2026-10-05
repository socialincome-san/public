const mockTransaction = jest.fn();

jest.mock('@/generated/prisma/client', () => ({
	Prisma: {},
	ProgramPermission: {
		owner: 'owner',
		operator: 'operator',
	},
}));

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		$transaction: mockTransaction,
	},
}));

import { updateOrganization } from './organization.repository';

describe('updateOrganization membership replacement', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('reassigns activeOrganizationId for removed members to another remaining org or null', async () => {
		const organizationAccessFindMany = jest.fn().mockResolvedValue([{ userId: 'user-removed' }, { userId: 'user-kept' }]);
		const organizationUpdate = jest.fn().mockResolvedValue({ id: 'org-a', name: 'Org A' });
		const organizationAccessDeleteMany = jest.fn().mockResolvedValue({ count: 2 });
		const organizationAccessCreateMany = jest.fn().mockResolvedValue({ count: 1 });
		const programAccessDeleteMany = jest.fn().mockResolvedValue({ count: 0 });
		const programAccessCreateMany = jest.fn().mockResolvedValue({ count: 0 });
		const userFindUnique = jest.fn().mockResolvedValue({ activeOrganizationId: 'org-a' });
		const remainingAccessFindFirst = jest.fn().mockResolvedValue({ organizationId: 'org-b' });
		const userUpdate = jest.fn().mockResolvedValue({ id: 'user-removed' });

		mockTransaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
			callback({
				organizationAccess: {
					findMany: organizationAccessFindMany,
					deleteMany: organizationAccessDeleteMany,
					createMany: organizationAccessCreateMany,
					findFirst: remainingAccessFindFirst,
				},
				organization: {
					update: organizationUpdate,
				},
				programAccess: {
					deleteMany: programAccessDeleteMany,
					createMany: programAccessCreateMany,
				},
				user: {
					findUnique: userFindUnique,
					update: userUpdate,
				},
			}),
		);

		await updateOrganization({
			id: 'org-a',
			name: 'Org A',
			userIds: ['user-kept'],
			ownedProgramIds: [],
			operatedProgramIds: [],
		});

		expect(userUpdate).toHaveBeenCalledWith({
			where: { id: 'user-removed' },
			data: { activeOrganizationId: 'org-b' },
		});
	});

	test('clears activeOrganizationId when a removed member has no remaining organization access', async () => {
		const organizationAccessFindMany = jest.fn().mockResolvedValue([{ userId: 'user-removed' }]);
		const organizationUpdate = jest.fn().mockResolvedValue({ id: 'org-a', name: 'Org A' });
		const organizationAccessDeleteMany = jest.fn().mockResolvedValue({ count: 1 });
		const organizationAccessCreateMany = jest.fn().mockResolvedValue({ count: 0 });
		const programAccessDeleteMany = jest.fn().mockResolvedValue({ count: 0 });
		const programAccessCreateMany = jest.fn().mockResolvedValue({ count: 0 });
		const userFindUnique = jest.fn().mockResolvedValue({ activeOrganizationId: 'org-a' });
		const remainingAccessFindFirst = jest.fn().mockResolvedValue(null);
		const userUpdate = jest.fn().mockResolvedValue({ id: 'user-removed' });

		mockTransaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
			callback({
				organizationAccess: {
					findMany: organizationAccessFindMany,
					deleteMany: organizationAccessDeleteMany,
					createMany: organizationAccessCreateMany,
					findFirst: remainingAccessFindFirst,
				},
				organization: {
					update: organizationUpdate,
				},
				programAccess: {
					deleteMany: programAccessDeleteMany,
					createMany: programAccessCreateMany,
				},
				user: {
					findUnique: userFindUnique,
					update: userUpdate,
				},
			}),
		);

		await updateOrganization({
			id: 'org-a',
			name: 'Org A',
			userIds: [],
			ownedProgramIds: [],
			operatedProgramIds: [],
		});

		expect(userUpdate).toHaveBeenCalledWith({
			where: { id: 'user-removed' },
			data: { activeOrganizationId: null },
		});
	});
});
