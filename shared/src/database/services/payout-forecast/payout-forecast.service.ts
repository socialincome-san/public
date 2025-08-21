import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ExchangeRateCollectionService } from '../exchange-rate-collection/exchange-rate-collection.service';
import { ProgramService } from '../program/program.service';
import { PayoutForecastTableViewProgramScoped, PayoutForecastTableViewRow } from './payout-forecast.types';

export class PayoutForecastService extends BaseService {
	private programService = new ProgramService();
	private exchangeRateService = new ExchangeRateCollectionService();

	async getPayoutForecastTableViewProgramScoped(
		userId: string,
		programId: string,
		monthsAhead: number,
	): Promise<ServiceResult<PayoutForecastTableViewProgramScoped>> {
		try {
			const programResult = await this.programService.getProgramWithRecipientsForForecast(programId, userId);
			if (!programResult.success) return this.resultFail(programResult.error!);

			const program = programResult.data;

			const forecastPeriods = this.buildNextMonthlyPeriods(monthsAhead);
			const recipientCountByPeriodIndex = new Map<number, number>(
				Array.from({ length: monthsAhead }, (_, i) => [i, 0]),
			);

			for (const recipient of program.recipients) {
				const remainingPayments = this.calculateRemainingMonthlyPayments(recipient.startDate, program.totalPayments);
				this.incrementNextPeriods(recipientCountByPeriodIndex, remainingPayments, monthsAhead);
			}

			const exchangeRateResult = await this.exchangeRateService.getLatestRates();
			if (!exchangeRateResult.success) return this.resultFail(exchangeRateResult.error!);

			const baseCurrencyRate = exchangeRateResult.data[program.payoutCurrency];
			const usdCurrencyRate = exchangeRateResult.data.USD;
			if (baseCurrencyRate == null || usdCurrencyRate == null) {
				return this.resultFail('Missing exchange rate');
			}

			const payoutAmountUsd = this.round2((program.payoutAmount / baseCurrencyRate) * usdCurrencyRate);

			const rows: PayoutForecastTableViewRow[] = forecastPeriods.map((periodStartDate, idx) => {
				const numberOfRecipients = recipientCountByPeriodIndex.get(idx) ?? 0;
				return {
					period: this.formatMothYear(periodStartDate),
					numberOfRecipients,
					amountInProgramCurrency: this.round2(numberOfRecipients * program.payoutAmount),
					amountUsd: this.round2(numberOfRecipients * payoutAmountUsd),
				};
			});

			return this.resultOk({ tableRows: rows });
		} catch (error) {
			console.error('[PayoutForecastService.getPayoutForecast]', error);
			return this.resultFail('Could not generate payout forecast');
		}
	}

	private buildNextMonthlyPeriods(monthsAhead: number): Date[] {
		const now = new Date();
		const firstNextMonth = this.startOfMonthUTC(this.addMonthsUTC(this.startOfMonthUTC(now), 1));
		return Array.from({ length: monthsAhead }, (_, index) => this.addMonthsUTC(firstNextMonth, index));
	}

	private calculateRemainingMonthlyPayments(startDate: Date | null, totalPayments: number): number {
		if (!startDate) return 0;
		const startOfMonth = this.startOfMonthUTC(startDate);
		const nowStartOfMonth = this.startOfMonthUTC(new Date());
		if (startOfMonth > nowStartOfMonth) return 0;
		const monthsElapsedInclusive = this.monthDiff(startOfMonth, nowStartOfMonth) + 1;
		return Math.max(0, totalPayments - monthsElapsedInclusive);
	}

	private incrementNextPeriods(periodMap: Map<number, number>, paymentsLeft: number, monthsAhead: number): void {
		let remainingPayments = paymentsLeft;
		for (let i = 0; i < monthsAhead && remainingPayments > 0; i++) {
			periodMap.set(i, (periodMap.get(i) ?? 0) + 1);
			remainingPayments--;
		}
	}

	private startOfMonthUTC(date: Date): Date {
		return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
	}

	private addMonthsUTC(date: Date, months: number): Date {
		return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
	}

	private monthDiff(start: Date, end: Date): number {
		return (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
	}

	private round2(value: number): number {
		return Math.round(value * 100) / 100;
	}

	private formatMothYear = (date: Date): string => {
		return new Intl.DateTimeFormat('en-CH', { month: 'long', year: 'numeric' }).format(date);
	};
}
