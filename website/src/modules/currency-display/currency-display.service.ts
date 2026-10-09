import { Currency } from '@/generated/prisma/enums';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { getLatestRates } from '@/modules/exchange-rates/exchange-rate.service';
import type { ExchangeRates } from '@/modules/exchange-rates/exchange-rate.types';
import type {
	ChfAmountsDisplayInput,
	DisplayAmount,
	WalletPayoutDisplayInput,
	WalletPayoutDisplaysInput,
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

export const resolveChfAmounts = async ({
	amounts,
	displayCurrency,
}: ChfAmountsDisplayInput): Promise<Result<DisplayAmount[]>> => {
	const rates = await getDisplayRates(displayCurrency);

	return resultOk(amounts.map((amount) => resolveFromChf(amount, displayCurrency, rates)));
};

export const resolveWalletPayoutDisplays = async ({
	payouts,
	displayCurrency,
}: WalletPayoutDisplaysInput): Promise<Result<DisplayAmount[]>> => {
	const rates = await getDisplayRates(displayCurrency);

	return resultOk(payouts.map((payout) => resolveWalletPayout(payout, displayCurrency, rates)));
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

const getDisplayRates = async (displayCurrency: WebsiteCurrency): Promise<ExchangeRates | undefined> => {
	if (displayCurrency === Currency.CHF) {
		return undefined;
	}
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
