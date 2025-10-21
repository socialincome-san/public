import { PrismaClient, UserRole } from '@prisma/client';
import { prisma } from '../../prisma';
import { ServiceResult } from './base.types';

export type AuthenticatedUser = {
	id: string;
	role: UserRole;
};

export abstract class BaseService {
	protected readonly db: PrismaClient;

	constructor(db: PrismaClient = prisma) {
		this.db = db;
	}

	protected resultOk<T>(data: T, status?: number): ServiceResult<T> {
		return { success: true, data, status };
	}

	protected resultFail<T = never>(error: string, status?: number): ServiceResult<T> {
		return { success: false, error, status };
	}

	/**
	 * Validates that a user exists and returns basic user information.
	 * This provides an auth guard to ensure only valid, existing users can access service methods.
	 */
	protected async requireUser(userId: string): Promise<ServiceResult<AuthenticatedUser>> {
		if (!userId) {
			return this.resultFail('User ID is required', 401);
		}

		try {
			const user = await this.db.user.findUnique({
				where: { id: userId },
				select: { id: true, role: true },
			});

			if (!user) {
				return this.resultFail('User not found', 401);
			}

			return this.resultOk(user);
		} catch {
			return this.resultFail('Could not authenticate user', 500);
		}
	}
}
