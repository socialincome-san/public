import { PayoutStatus } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';
import { PayoutForecastTableViewProgramScoped, PayoutForecastTableViewRow } from './payout-forecast.types';

export class PayoutForecastService extends BaseService {
	private exchangeRateService = new ExchangeRateService();

	async getPayoutForecastTableViewProgramScoped(
		userId: string,
		programId: string,
		monthsAhead: number,
	): Promise<ServiceResult<PayoutForecastTableViewProgramScoped>> {
		const authResult = await this.requireUser(userId);
		if (!authResult.success) {
			return this.resultFail(authResult.error, authResult.status);
		}

		try {
			const program = await this.db.program.findFirst({
				where: {
					id: programId,
					accesses: { some: { userId } },
				},
				select: {
					totalPayments: true,
					payoutAmount: true,
					payoutCurrency: true,
					payoutInterval: true,
					recipients: {
						select: {
							startDate: true,
							payouts: {
								where: { status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] } },
								select: { id: true },
							},
						},
					},
				},
			});

			if (!program) {
				return this.resultFail('Program not found or access denied');
			}

			const forecastPeriods = this.buildNextMonthlyPeriods(monthsAhead);
			const recipientCountByPeriodIndex = new Map<number, number>(
				Array.from({ length: monthsAhead }, (_, i) => [i, 0]),
			);

			for (const recipient of program.recipients) {
				const alreadyPaidCount = recipient.payouts.length;
				const remainingPayments = Math.max(0, program.totalPayments - alreadyPaidCount);
				this.incrementNextPeriods(recipientCountByPeriodIndex, remainingPayments, monthsAhead);
			}

			const exchangeRateResult = await this.exchangeRateService.getLatestRates();
			if (!exchangeRateResult.success) return this.resultFail(exchangeRateResult.error!);

			const baseCurrencyRate = exchangeRateResult.data[program.payoutCurrency];
			const usdCurrencyRate = exchangeRateResult.data.USD;
			if (baseCurrencyRate == null || usdCurrencyRate == null) {
				return this.resultFail('Missing exchange rate');
			}

			const payoutAmountUsd = this.round2((program.payoutAmount.toNumber() / baseCurrencyRate) * usdCurrencyRate);

			const rows: PayoutForecastTableViewRow[] = forecastPeriods.map((periodStartDate, idx) => {
				const numberOfRecipients = recipientCountByPeriodIndex.get(idx) ?? 0;
				return {
					period: this.formatMonthYear(periodStartDate),
					numberOfRecipients,
					amountInProgramCurrency: this.round2(numberOfRecipients * program.payoutAmount.toNumber()),
					amountUsd: this.round2(numberOfRecipients * payoutAmountUsd),
				};
			});

			return this.resultOk({ tableRows: rows });
		} catch {
			return this.resultFail('Could not generate payout forecast');
		}
	}

	private buildNextMonthlyPeriods(monthsAhead: number): Date[] {
		const now = new Date();
		const firstNextMonth = this.startOfMonthUTC(this.addMonthsUTC(this.startOfMonthUTC(now), 1));
		return Array.from({ length: monthsAhead }, (_, index) => this.addMonthsUTC(firstNextMonth, index));
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

	private round2(value: number): number {
		return Math.round(value * 100) / 100;
	}

	private formatMonthYear(date: Date): string {
		return new Intl.DateTimeFormat('en-CH', { month: 'long', year: 'numeric' }).format(date);
	}
}
