import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../../prisma';
import { UserInformation } from '../user/user.types';
import { ServiceResult } from './base.types';

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

	protected userAccessibleProgramsWhere(userId: string): Prisma.ProgramWhereInput {
		return {
			OR: [
				{ viewerOrganization: { users: { some: { id: userId } } } },
				{ operatorOrganization: { users: { some: { id: userId } } } },
			],
		};
	}

	protected requireGlobalAnalystOrAdmin<T>(user: UserInformation): ServiceResult<T> | null {
		if (user.role !== 'globalAnalyst' && user.role !== 'globalAdmin') {
			return this.resultFail('Access denied', 403);
		}
		return null;
	}
}
