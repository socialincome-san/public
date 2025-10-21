import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { PrismaClient, UserRole } from '@prisma/client';
import { BaseService } from './base.service';

// Create a concrete test implementation of BaseService
class TestService extends BaseService {
	// Expose requireUser for testing
	public async testRequireUser(userId: string) {
		return this.requireUser(userId);
	}
}

describe('BaseService Auth Guard', () => {
	let mockPrisma: jest.Mocked<PrismaClient>;
	let service: TestService;

	beforeEach(() => {
		// Create a mock Prisma client
		mockPrisma = {
			user: {
				findUnique: jest.fn(),
			},
		} as any;

		service = new TestService(mockPrisma);
	});

	test('requireUser returns error when userId is empty', async () => {
		const result = await service.testRequireUser('');

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('User ID is required');
			expect(result.status).toBe(401);
		}
	});

	test('requireUser returns error when user does not exist', async () => {
		mockPrisma.user.findUnique.mockResolvedValue(null);

		const result = await service.testRequireUser('non-existent-user-id');

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('User not found');
			expect(result.status).toBe(401);
		}
		expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
			where: { id: 'non-existent-user-id' },
			select: { id: true, role: true },
		});
	});

	test('requireUser returns user data when user exists', async () => {
		const mockUser = {
			id: 'test-user-id',
			role: UserRole.admin,
		};
		mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

		const result = await service.testRequireUser('test-user-id');

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual(mockUser);
		}
		expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
			where: { id: 'test-user-id' },
			select: { id: true, role: true },
		});
	});

	test('requireUser handles database errors gracefully', async () => {
		mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection error'));

		const result = await service.testRequireUser('test-user-id');

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('Could not authenticate user');
			expect(result.status).toBe(500);
		}
	});

	test('requireUser validates different user roles', async () => {
		const roles = [UserRole.admin, UserRole.contributor, UserRole.operator];

		for (const role of roles) {
			const mockUser = {
				id: `test-user-${role}`,
				role: role,
			};
			mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

			const result = await service.testRequireUser(`test-user-${role}`);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.role).toBe(role);
			}
		}
	});
});
