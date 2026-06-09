import { PayoutProcess, PrismaClient } from '@/generated/prisma/client';
import { stringifyCsvLines } from '@/lib/utils/csv';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { PayoutProcessCoreService } from './payout-process-core.service';
import type { PayoutRecipient, PreviewPayout } from './payout-process.types';
import { formatTelecelMsisdn } from './telecel-csv';

export class TelecelCsvPayoutProcessService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly core: PayoutProcessCoreService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private async getProviderIds(): Promise<ServiceResult<string[]>> {
		const providers = await this.db.mobileMoneyProvider.findMany({
			where: { payoutProcess: PayoutProcess.telecel_csv },
			select: { id: true },
		});

		if (providers.length === 0) {
			return this.resultFail('No mobile money providers are configured for Telecel CSV upload');
		}

		return this.resultOk(providers.map((provider) => provider.id));
	}

	buildPayoutCsv(recipients: PayoutRecipient[]): string {
		const csvRows: string[][] = [['MSISDN', 'Amount', 'Telco']];

		for (const recipient of recipients) {
			const phone = recipient.paymentInformation?.phone?.number ?? 'NO_PHONE';
			const providerName = recipient.paymentInformation?.mobileMoneyProvider?.name ?? '';
			const amount = Number(recipient.program?.payoutPerInterval ?? 0);

			csvRows.push([formatTelecelMsisdn(phone.toString()), amount.toString(), providerName]);
		}

		return stringifyCsvLines(csvRows);
	}

	async generatePayoutCSV(userId: string, selectedDate: Date): Promise<ServiceResult<string>> {
		try {
			const providerIdsResult = await this.getProviderIds();
			if (!providerIdsResult.success) {
				return this.resultFail(providerIdsResult.error);
			}

			const recipientsResult = await this.core.getRecipientsReadyForPayout(userId, providerIdsResult.data, selectedDate);
			if (!recipientsResult.success) {
				return this.resultFail(recipientsResult.error);
			}

			return this.resultOk(this.buildPayoutCsv(recipientsResult.data));
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not generate payout CSV: ${JSON.stringify(error)}`);
		}
	}

	async countCurrentMonthPayouts(userId: string, selectedDate: Date): Promise<ServiceResult<number>> {
		const providerIdsResult = await this.getProviderIds();
		if (!providerIdsResult.success) {
			return this.resultFail(providerIdsResult.error);
		}

		const recipientsResult = await this.core.getRecipientsReadyForPayout(userId, providerIdsResult.data, selectedDate);
		if (!recipientsResult.success) {
			return this.resultFail(recipientsResult.error);
		}

		const count = this.core.countCurrentMonthPayouts(recipientsResult.data, selectedDate);

		return this.resultOk(count);
	}

	async previewCurrentMonthPayouts(userId: string, selectedDate: Date): Promise<ServiceResult<PreviewPayout[]>> {
		const providerIdsResult = await this.getProviderIds();
		if (!providerIdsResult.success) {
			return this.resultFail(providerIdsResult.error);
		}

		const recipientsResult = await this.core.getRecipientsReadyForPayout(userId, providerIdsResult.data, selectedDate);
		if (!recipientsResult.success) {
			return this.resultFail(recipientsResult.error);
		}

		return this.core.previewCurrentMonthPayouts(recipientsResult.data, selectedDate);
	}

	async generateCurrentMonthPayouts(userId: string, selectedDate: Date): Promise<ServiceResult<string>> {
		const previewResult = await this.previewCurrentMonthPayouts(userId, selectedDate);
		if (!previewResult.success) {
			return this.resultFail(previewResult.error);
		}

		return this.core.generateCurrentMonthPayouts(previewResult.data, selectedDate);
	}
}
