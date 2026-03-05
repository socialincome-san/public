import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import { ExchangeRateImportService } from './exchange-rate-import.service';

export class ExchangeRateWriteService extends BaseService {
	private userService = new UserReadService();
	private importService = new ExchangeRateImportService();

	async triggerImportAsAdmin(userId: string): Promise<ServiceResult<void>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		return await this.importService.import();
	}
}
