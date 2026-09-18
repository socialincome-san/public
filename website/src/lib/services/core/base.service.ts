import { PrismaClient } from '@/generated/prisma/client';
import { ServiceResult } from './base.types';
import { resultFail, resultOk } from './service-result';

export abstract class BaseService {
	protected readonly db: PrismaClient;

	constructor(db: PrismaClient) {
		this.db = db;
	}

	protected resultOk<T>(data: T, status?: number): ServiceResult<T> {
		return resultOk(data, status);
	}

	protected resultFail<T = never>(error: string, status?: number): ServiceResult<T> {
		return resultFail(error, status);
	}
}
