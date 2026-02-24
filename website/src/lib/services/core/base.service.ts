import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { ServiceResult } from './base.types';

export abstract class BaseService {
	protected readonly db: PrismaClient;
	protected readonly logger;

	constructor(db: PrismaClient, loggerInstance = logger) {
		this.db = db;
		this.logger = loggerInstance;
	}

	protected resultOk<T>(data: T, status?: number): ServiceResult<T> {
		return { success: true, data, status };
	}

	protected resultFail<T = never>(error: string, status?: number): ServiceResult<T> {
		return { success: false, error, status };
	}
}
