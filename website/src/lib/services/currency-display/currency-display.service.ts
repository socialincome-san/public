import type { Currency } from '@/generated/prisma/client';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { ExchangeRateReadService } from '../exchange-rate/exchange-rate-read.service';
import type { ExchangeRates } from '../exchange-rate/exchange-rate.types';
import type { DisplayAmount, WalletPayoutDisplayInput } from './currency-display.types';

export class CurrencyDisplayService {
	constructor(private readonly exchangeRateService: ExchangeRateReadService) {}

	convertAmount(amount: number, fromCurrency: Currency, toCurrency: Currency, rates?: ExchangeRates): number | undefined {
		if (fromCurrency === toCurrency) {
			return amount;
		}
		if (!rates) {
			return undefined;
		}
		const fromRate = rates[fromCurrency];
		const toRate = rates[toCurrency];
		if (
			fromRate === undefined ||
			toRate === undefined ||
			!Number.isFinite(fromRate) ||
			!Number.isFinite(toRate) ||
			fromRate <= 0 ||
			toRate <= 0
		) {
			return undefined;
		}

		return amount * (toRate / fromRate);
	}

	async getLatestRatesOrUndefined(): Promise<ExchangeRates | undefined> {
		const latestRatesResult = await this.exchangeRateService.getLatestRates();

		return latestRatesResult.success ? latestRatesResult.data : undefined;
	}

	async resolveFromChf(amountChf: number, displayCurrency: WebsiteCurrency, rates?: ExchangeRates): Promise<DisplayAmount> {
		if (displayCurrency === 'CHF') {
			return { amount: amountChf, currency: 'CHF' };
		}

		const resolvedRates = rates ?? (await this.getLatestRatesOrUndefined());
		const converted = this.convertAmount(amountChf, 'CHF', displayCurrency, resolvedRates);
		if (converted === undefined) {
			return { amount: amountChf, currency: 'CHF' };
		}

		return { amount: converted, currency: displayCurrency };
	}

	resolveWalletPayoutDisplay(
		{ totalPayoutsSum, totalPayoutsSumChf, payoutCurrency, displayCurrency }: WalletPayoutDisplayInput,
		rates?: ExchangeRates,
	): DisplayAmount {
		if (displayCurrency === payoutCurrency) {
			return { amount: totalPayoutsSum, currency: payoutCurrency };
		}

		if (displayCurrency === 'CHF') {
			return { amount: totalPayoutsSumChf, currency: 'CHF' };
		}

		const converted = this.convertAmount(totalPayoutsSumChf, 'CHF', displayCurrency, rates);
		if (converted === undefined) {
			return { amount: totalPayoutsSum, currency: payoutCurrency };
		}

		return { amount: converted, currency: displayCurrency };
	}

	async fetchWalletPayoutDisplayRates(displayCurrency: WebsiteCurrency): Promise<ExchangeRates | undefined> {
		if (displayCurrency === 'CHF') {
			return undefined;
		}

		return this.getLatestRatesOrUndefined();
	}
}
