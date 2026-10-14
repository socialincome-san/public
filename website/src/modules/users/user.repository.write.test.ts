const mockTransaction = jest.fn();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		$transaction: mockTransaction,
	},
}));

import { updateOrganizationMembers } from './user.repository.write';

const audit = { actor: { type: 'user' as const, id: 'admin-1' }, source: 'portal' as const };

const mockTransactionWith = (remainingAccess: { organizationId: string } | null) => {
	const userUpdate = jest.fn().mockResolvedValue({ id: 'user-removed' });
	mockTransaction.mockImplementation(async (callback: (transaction: unknown) => Promise<unknown>) =>
		callback({
			organizationAccess: {
				deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
				createMany: jest.fn().mockResolvedValue({ count: 1 }),
				findFirst: jest.fn().mockResolvedValue(remainingAccess),
			},
			user: {
				findMany: jest.fn().mockResolvedValue([{ id: 'user-removed' }]),
				findUnique: jest.fn().mockResolvedValue({ role: 'user' }),
				update: userUpdate,
			},
			auditEvent: {
				findFirst: jest.fn().mockResolvedValue(null),
				createMany: jest.fn().mockResolvedValue({ count: 1 }),
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
		const userUpdate = mockTransactionWith({ organizationId: 'org-b' });

		await updateOrganizationMembers(audit, ['user-removed', 'user-kept'], {
			organizationId: 'org-a',
			memberIds: ['user-kept'],
		});

		expect(userUpdate).toHaveBeenCalledWith({
			where: { id: 'user-removed' },
			data: { activeOrganizationId: 'org-b' },
		});
	});

	test('clears the active organization when a removed member has none left', async () => {
		const userUpdate = mockTransactionWith(null);

		await updateOrganizationMembers(audit, ['user-removed'], { organizationId: 'org-a', memberIds: [] });

		expect(userUpdate).toHaveBeenCalledWith({
			where: { id: 'user-removed' },
			data: { activeOrganizationId: null },
		});
	});
});
