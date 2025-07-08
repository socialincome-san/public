import { PrismaClient } from '@prisma/client';
import { prisma } from '../../prisma';
import { ServiceResult } from './base.types';

export abstract class BaseService {
	protected readonly db: PrismaClient;

	constructor(db: PrismaClient = prisma) {
		this.db = db;
	}

	protected resultOk<T>(data: T): ServiceResult<T> {
		return { success: true, data };
	}

	protected resultFail<T = never>(error: string): ServiceResult<T> {
		return { success: false, error };
	}
}
