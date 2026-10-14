const mockTransaction = jest.fn();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		$transaction: mockTransaction,
	},
}));

import { updateOrganizationMembers } from './user.repository.write';

const audit = { actor: { type: 'user' as const, id: 'admin-1' }, source: 'portal' as const };

const mockCreateAuditEvents = jest.fn();

const mockTransactionWith = (previousMemberIds: string[], remainingAccess: { organizationId: string } | null) => {
	const userUpdate = jest.fn().mockResolvedValue({ id: 'user-removed' });
	mockTransaction.mockImplementation(async (callback: (transaction: unknown) => Promise<unknown>) =>
		callback({
			organizationAccess: {
				deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
				createMany: jest.fn().mockResolvedValue({ count: 1 }),
				findFirst: jest.fn().mockResolvedValue(remainingAccess),
				findMany: jest.fn().mockResolvedValue(previousMemberIds.map((userId) => ({ userId }))),
			},
			user: {
				findMany: jest.fn().mockResolvedValue([{ id: 'user-removed' }]),
				findUnique: ({ where }: { where: { id: string } }) =>
					Promise.resolve({ role: 'user', contact: { firstName: where.id, lastName: 'User' } }),
				update: userUpdate,
			},
			auditEvent: {
				findFirst: jest.fn().mockResolvedValue(null),
				createMany: mockCreateAuditEvents,
			},
		}),
	);

	return userUpdate;
};

describe('updateOrganizationMembers', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('moves a removed member to their oldest remaining organization', async () => {
		const userUpdate = mockTransactionWith(['user-removed', 'user-kept'], { organizationId: 'org-b' });

		await updateOrganizationMembers(audit, { organizationId: 'org-a', memberIds: ['user-kept'] });

		expect(userUpdate).toHaveBeenCalledWith({
			where: { id: 'user-removed' },
			data: { activeOrganizationId: 'org-b' },
		});
	});

	test('clears the active organization when a removed member has none left', async () => {
		const userUpdate = mockTransactionWith(['user-removed'], null);

		await updateOrganizationMembers(audit, { organizationId: 'org-a', memberIds: [] });

		expect(userUpdate).toHaveBeenCalledWith({
			where: { id: 'user-removed' },
			data: { activeOrganizationId: null },
		});
	});

	test('stores an event for every previous and new member, read in the same transaction', async () => {
		mockTransactionWith(['user-removed', 'user-kept'], null);

		await updateOrganizationMembers(audit, { organizationId: 'org-a', memberIds: ['user-kept', 'user-new'] });

		expect(mockCreateAuditEvents).toHaveBeenCalledWith({
			data: ['user-removed', 'user-kept', 'user-new'].map((entityId): unknown =>
				expect.objectContaining({ entityType: 'user', entityId, entityName: `${entityId} User` }),
			),
		});
	});
});
