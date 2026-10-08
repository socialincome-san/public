import { Currency } from '@/generated/prisma/enums';
import { mapWebsiteCurrencies, type WebsiteCurrency } from '@/lib/i18n/utils';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { getLatestRates } from '@/modules/exchange-rates/exchange-rate.service';
import type { ExchangeRates } from '@/modules/exchange-rates/exchange-rate.types';
import type {
	ChfAmountsDisplayInput,
	DisplayAmount,
	DisplayAmountsByCurrency,
	WalletPayoutDisplayInput,
} from './currency-display.types';

export const convertAmount = (
	amount: number,
	fromCurrency: Currency,
	toCurrency: Currency,
	rates?: ExchangeRates,
): Result<number> => {
	if (fromCurrency === toCurrency) {
		return resultOk(amount);
	}
	if (!rates) {
		return resultFail('Exchange rates are unavailable');
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
		return resultFail('Exchange rates are unavailable');
	}

	return resultOk(amount * (toRate / fromRate));
};

export const resolveChfAmounts = async ({ amounts }: ChfAmountsDisplayInput): Promise<Result<DisplayAmountsByCurrency>> => {
	const rates = await getDisplayRates();

	return resultOk(
		mapWebsiteCurrencies((displayCurrency) => amounts.map((amount) => resolveFromChf(amount, displayCurrency, rates))),
	);
};

export const resolveWalletPayoutDisplays = async (
	inputs: WalletPayoutDisplayInput[],
): Promise<Result<DisplayAmountsByCurrency>> => {
	const rates = await getDisplayRates();

	return resultOk(
		mapWebsiteCurrencies((displayCurrency) => inputs.map((input) => resolveWalletPayout(input, displayCurrency, rates))),
	);
};

const resolveWalletPayout = (
	input: WalletPayoutDisplayInput,
	displayCurrency: WebsiteCurrency,
	rates: ExchangeRates | undefined,
): DisplayAmount => {
	if (displayCurrency === input.payoutCurrency) {
		return { amount: input.totalPayoutsSum, currency: input.payoutCurrency };
	}
	if (displayCurrency === Currency.CHF) {
		return { amount: input.totalPayoutsSumChf, currency: Currency.CHF };
	}

	const converted = convertAmount(input.totalPayoutsSumChf, Currency.CHF, displayCurrency, rates);
	if (!converted.success) {
		return { amount: input.totalPayoutsSum, currency: input.payoutCurrency };
	}

	return { amount: converted.data, currency: displayCurrency };
};

const getDisplayRates = async (): Promise<ExchangeRates | undefined> => {
	const latestRatesResult = await getLatestRates();

	return latestRatesResult.success ? latestRatesResult.data : undefined;
};

const resolveFromChf = (amountChf: number, displayCurrency: WebsiteCurrency, rates?: ExchangeRates): DisplayAmount => {
	if (displayCurrency === Currency.CHF) {
		return { amount: amountChf, currency: Currency.CHF };
	}

	const converted = convertAmount(amountChf, Currency.CHF, displayCurrency, rates);

	return converted.success
		? { amount: converted.data, currency: displayCurrency }
		: { amount: amountChf, currency: Currency.CHF };
};
