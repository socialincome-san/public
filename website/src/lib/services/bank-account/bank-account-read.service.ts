import { type BankAccount } from '@/generated/prisma/client';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';

export class BankAccountReadService extends BaseService {
	async getAll(): Promise<ServiceResult<BankAccount[]>> {
		try {
			return this.resultOk(await this.db.bankAccount.findMany());
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not get bank accounts: ${JSON.stringify(error)}`);
		}
	}
}
