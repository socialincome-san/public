import { PayoutProcess, PrismaClient } from '@/generated/prisma/client';
import { stringifyCsvLines } from '@/lib/utils/csv';
import { logger } from '@/lib/utils/logger';
import { now } from '@/lib/utils/now';
import { format } from 'date-fns';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { PayoutProcessCoreService } from './payout-process-core.service';
import type { PayoutRecipient, PreviewPayout } from './payout-process.types';

export class OrangeMoneyCsvPayoutProcessService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly core: PayoutProcessCoreService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private async validateProvider(mobileMoneyProviderId: string): Promise<ServiceResult<void>> {
		const provider = await this.db.mobileMoneyProvider.findUnique({
			where: { id: mobileMoneyProviderId },
			select: { payoutProcess: true },
		});

		if (provider?.payoutProcess !== PayoutProcess.orange_money_csv) {
			return this.resultFail('Mobile money provider is not configured for Orange Money CSV upload');
		}

		return this.resultOk(undefined);
	}

	buildRegistrationCsv(recipients: PayoutRecipient[]): string {
		const csvRows: string[][] = [['Mobile Number*', 'Unique Code*', 'User Type*']];

		for (const recipient of recipients) {
			const code = recipient.paymentInformation?.code ?? 'NO_CODE';
			const phone = recipient.paymentInformation?.phone?.number ?? 'NO_PHONE';
			csvRows.push([phone.toString().slice(-8), code.toString(), 'subscriber']);
		}

		return stringifyCsvLines(csvRows);
	}

	buildPayoutCsv(recipients: PayoutRecipient[], selectedDate: Date): string {
		const monthLabel = format(selectedDate, 'MMMM yyyy');
		const csvRows: string[][] = [
			['Mobile Number*', 'Amount*', 'First Name', 'Last Name', 'Id Number', 'Remarks*', 'User Type*'],
		];

		for (const recipient of recipients) {
			const code = recipient.paymentInformation?.code ?? 'NO_CODE';
			const phone = recipient.paymentInformation?.phone?.number ?? 'NO_PHONE';
			const firstName = recipient.contact?.firstName ?? '';
			const lastName = recipient.contact?.lastName ?? '';
			const amount = Number(recipient.program?.payoutPerInterval ?? 0);

			csvRows.push([
				phone.toString().slice(-8),
				amount.toString(),
				firstName,
				lastName,
				code.toString(),
				`Social Income ${monthLabel}`,
				'subscriber',
			]);
		}

		return stringifyCsvLines(csvRows);
	}

	async generateRegistrationCSV(userId: string, mobileMoneyProviderId: string): Promise<ServiceResult<string>> {
		try {
			const validation = await this.validateProvider(mobileMoneyProviderId);
			if (!validation.success) {
				return this.resultFail(validation.error);
			}

			const recipientsResult = await this.core.getRecipientsReadyForPayout(userId, [mobileMoneyProviderId], now());
			if (!recipientsResult.success) {
				return this.resultFail(recipientsResult.error);
			}

			return this.resultOk(this.buildRegistrationCsv(recipientsResult.data));
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not generate registration CSV: ${JSON.stringify(error)}`);
		}
	}

	async generatePayoutCSV(
		userId: string,
		mobileMoneyProviderId: string,
		selectedDate: Date,
	): Promise<ServiceResult<string>> {
		try {
			const validation = await this.validateProvider(mobileMoneyProviderId);
			if (!validation.success) {
				return this.resultFail(validation.error);
			}

			const recipientsResult = await this.core.getRecipientsReadyForPayout(userId, [mobileMoneyProviderId], selectedDate);
			if (!recipientsResult.success) {
				return this.resultFail(recipientsResult.error);
			}

			return this.resultOk(this.buildPayoutCsv(recipientsResult.data, selectedDate));
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not generate payout CSV: ${JSON.stringify(error)}`);
		}
	}

	async countCurrentMonthPayouts(
		userId: string,
		mobileMoneyProviderId: string,
		selectedDate: Date,
	): Promise<ServiceResult<number>> {
		const validation = await this.validateProvider(mobileMoneyProviderId);
		if (!validation.success) {
			return this.resultFail(validation.error);
		}

		const recipientsResult = await this.core.getRecipientsReadyForPayout(userId, [mobileMoneyProviderId], selectedDate);
		if (!recipientsResult.success) {
			return this.resultFail(recipientsResult.error);
		}

		const count = this.core.countCurrentMonthPayouts(recipientsResult.data, selectedDate);

		return this.resultOk(count);
	}

	async previewCurrentMonthPayouts(
		userId: string,
		mobileMoneyProviderId: string,
		selectedDate: Date,
	): Promise<ServiceResult<PreviewPayout[]>> {
		const validation = await this.validateProvider(mobileMoneyProviderId);
		if (!validation.success) {
			return this.resultFail(validation.error);
		}

		const recipientsResult = await this.core.getRecipientsReadyForPayout(userId, [mobileMoneyProviderId], selectedDate);
		if (!recipientsResult.success) {
			return this.resultFail(recipientsResult.error);
		}

		return this.core.previewCurrentMonthPayouts(recipientsResult.data, selectedDate);
	}

	async generateCurrentMonthPayouts(
		userId: string,
		mobileMoneyProviderId: string,
		selectedDate: Date,
	): Promise<ServiceResult<string>> {
		const previewResult = await this.previewCurrentMonthPayouts(userId, mobileMoneyProviderId, selectedDate);
		if (!previewResult.success) {
			return this.resultFail(previewResult.error);
		}

		return this.core.generateCurrentMonthPayouts(previewResult.data, selectedDate);
	}
}
