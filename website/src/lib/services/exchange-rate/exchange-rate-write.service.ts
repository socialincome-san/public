import { PrismaClient } from '@/generated/prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import { ExchangeRateImportService } from './exchange-rate-import.service';

export class ExchangeRateWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		private readonly importService: ExchangeRateImportService,
	) {
		super(db);
	}

	async triggerImportAsAdmin(userId: string): Promise<ServiceResult<void>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			return await this.importService.import();
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not trigger exchange rate import: ${JSON.stringify(error)}`);
		}
	}
}
