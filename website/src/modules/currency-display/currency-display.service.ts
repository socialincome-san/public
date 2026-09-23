import { Currency } from '@/generated/prisma/enums';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { getLatestRates } from '@/modules/exchange-rates/exchange-rate.service';
import type { ExchangeRates } from '@/modules/exchange-rates/exchange-rate.types';
import type { ChfAmountsDisplayInput, DisplayAmount, WalletPayoutDisplayInput } from './currency-display.types';

export const convertAmount = (
	amount: number,
	fromCurrency: Currency,
	toCurrency: Currency,
	rates?: ExchangeRates,
): ServiceResult<number> => {
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
}: ChfAmountsDisplayInput): Promise<ServiceResult<DisplayAmount[]>> => {
	const rates = displayCurrency === Currency.CHF ? undefined : await getDisplayRates();

	return resultOk(amounts.map((amount) => resolveFromChf(amount, displayCurrency, rates)));
};

export const resolveWalletPayoutDisplay = async (input: WalletPayoutDisplayInput): Promise<ServiceResult<DisplayAmount>> => {
	const rates = input.displayCurrency === Currency.CHF ? undefined : await getDisplayRates();

	return resultOk(resolveWalletPayout(input, rates));
};

export const resolveWalletPayoutDisplays = async (
	inputs: WalletPayoutDisplayInput[],
): Promise<ServiceResult<DisplayAmount[]>> => {
	const rates = inputs.some(({ displayCurrency }) => displayCurrency !== Currency.CHF) ? await getDisplayRates() : undefined;

	return resultOk(inputs.map((input) => resolveWalletPayout(input, rates)));
};

const resolveWalletPayout = (input: WalletPayoutDisplayInput, rates: ExchangeRates | undefined): DisplayAmount => {
	if (input.displayCurrency === input.payoutCurrency) {
		return { amount: input.totalPayoutsSum, currency: input.payoutCurrency };
	}
	if (input.displayCurrency === Currency.CHF) {
		return { amount: input.totalPayoutsSumChf, currency: Currency.CHF };
	}

	const converted = convertAmount(input.totalPayoutsSumChf, Currency.CHF, input.displayCurrency, rates);
	if (!converted.success) {
		return { amount: input.totalPayoutsSum, currency: input.payoutCurrency };
	}

	return { amount: converted.data, currency: input.displayCurrency };
};

const getDisplayRates = async (): Promise<ExchangeRates | undefined> => {
	const latestRatesResult = await getLatestRates();

	return latestRatesResult.success ? latestRatesResult.data : undefined;
};

const resolveFromChf = (
	amountChf: number,
	displayCurrency: ChfAmountsDisplayInput['displayCurrency'],
	rates?: ExchangeRates,
): DisplayAmount => {
	if (displayCurrency === Currency.CHF) {
		return { amount: amountChf, currency: Currency.CHF };
	}

	const converted = convertAmount(amountChf, Currency.CHF, displayCurrency, rates);

	return converted.success
		? { amount: converted.data, currency: displayCurrency }
		: { amount: amountChf, currency: Currency.CHF };
};
