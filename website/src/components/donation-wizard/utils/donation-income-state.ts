import type { WebsiteCurrency } from '@/lib/i18n/utils';
import type { DonationAmountContext } from './donation-amount';
import {
	convertDonationIncomeCurrency,
	getDonationExampleIncome,
	type DonationExampleCountryCode,
} from './donation-example-income';

export const updateDonationCountry = (
	context: DonationAmountContext,
	countryCode: DonationExampleCountryCode | null,
	isManualSelection: boolean,
): DonationAmountContext => {
	if (!isManualSelection && context.countryIsManuallySelected) {
		return context;
	}

	if (countryCode === context.exampleCountryCode && context.countryIsManuallySelected === isManualSelection) {
		return context;
	}

	const countryContext = {
		...context,
		exampleCountryCode: countryCode,
		countryIsManuallySelected: isManualSelection || context.countryIsManuallySelected,
	};

	if (context.monthlyIncomeSource === 'manual' || context.donationAmountIsManual) {
		return countryContext;
	}

	const example = getDonationExampleIncome(countryCode, context.monthlyIncomeCurrency);
	if (!example) {
		return {
			...countryContext,
			monthlyIncome: null,
			monthlyIncomeSource: 'generic',
			selectedAmount: 50,
			customAmount: null,
			donationAmountIsManual: false,
		};
	}

	return {
		...countryContext,
		monthlyIncome: example.monthlyIncome,
		monthlyIncomeSource: 'example',
		selectedAmount: null,
		customAmount: null,
		donationAmountIsManual: false,
	};
};

export const updateDonationIncomeCurrency = (
	context: DonationAmountContext,
	currency: WebsiteCurrency,
): DonationAmountContext => {
	if (context.monthlyIncomeCurrency === currency) {
		return context;
	}

	const monthlyIncome =
		context.monthlyIncomeSource === 'example'
			? (getDonationExampleIncome(context.exampleCountryCode, currency)?.monthlyIncome ?? null)
			: context.monthlyIncomeSource === 'manual' && context.monthlyIncome !== null
				? convertDonationIncomeCurrency(context.monthlyIncome, context.monthlyIncomeCurrency, currency)
				: null;

	return {
		...context,
		monthlyIncome,
		monthlyIncomeCurrency: currency,
		monthlyIncomeSource:
			context.monthlyIncomeSource === 'example' && monthlyIncome === null ? 'generic' : context.monthlyIncomeSource,
		selectedAmount:
			context.monthlyIncomeSource === 'example' && monthlyIncome === null && !context.donationAmountIsManual
				? 50
				: context.selectedAmount,
	};
};
