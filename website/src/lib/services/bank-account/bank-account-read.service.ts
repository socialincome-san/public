import { type BankAccount, type PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';

export class BankAccountReadService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	async getAll(): Promise<ServiceResult<BankAccount[]>> {
		try {
			return this.resultOk(await this.db.bankAccount.findMany());
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not get bank accounts: ${JSON.stringify(error)}`);
		}
	}
}
