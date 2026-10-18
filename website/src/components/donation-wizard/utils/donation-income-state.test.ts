import { getInitialDonationContext } from './donation-amount';
import { updateDonationCountry, updateDonationIncomeCurrency } from './donation-income-state';

describe('donation-income-state', () => {
	test('selects a country example and defaults unsupported countries to the generic donation', () => {
		const example = updateDonationCountry(getInitialDonationContext('CHF'), 'CH', false);
		expect(example).toMatchObject({
			monthlyIncome: 8000,
			monthlyIncomeSource: 'example',
			selectedAmount: null,
		});

		const fallback = updateDonationCountry(getInitialDonationContext('USD'), 'US', false);
		expect(fallback).toMatchObject({
			monthlyIncome: null,
			monthlyIncomeSource: 'generic',
			selectedAmount: 50,
		});
	});

	test('preserves manually entered income when the country changes', () => {
		const context = {
			...getInitialDonationContext('CHF'),
			monthlyIncome: 6100,
			monthlyIncomeSource: 'manual' as const,
			selectedAmount: null,
		};

		expect(updateDonationCountry(context, 'DE', false)).toMatchObject({
			monthlyIncome: 6100,
			monthlyIncomeSource: 'manual',
			exampleCountryCode: 'DE',
		});
	});

	test('preserves a visitor-selected donation amount when the country changes', () => {
		const context = {
			...getInitialDonationContext('CHF'),
			selectedAmount: 'other' as const,
			customAmount: 75,
			donationAmountIsManual: true,
		};

		expect(updateDonationCountry(context, 'DE', false)).toMatchObject({
			selectedAmount: 'other',
			customAmount: 75,
			donationAmountIsManual: true,
		});
	});

	test('manual country selection is not replaced by later visitor detection', () => {
		const manualSelection = updateDonationCountry(getInitialDonationContext('CHF'), 'DE', true);

		expect(updateDonationCountry(manualSelection, 'CH', false)).toBe(manualSelection);
	});

	test('updates examples and converts manually entered income on currency changes', () => {
		const example = updateDonationCountry(getInitialDonationContext('CHF'), 'CH', false);
		expect(updateDonationIncomeCurrency(example, 'EUR')).toMatchObject({
			monthlyIncome: 8400,
			monthlyIncomeCurrency: 'EUR',
			monthlyIncomeSource: 'example',
		});

		const manualIncome = {
			...getInitialDonationContext('CHF'),
			monthlyIncome: 5000,
			monthlyIncomeSource: 'manual' as const,
		};
		expect(updateDonationIncomeCurrency(manualIncome, 'EUR')).toMatchObject({
			monthlyIncome: 5248,
			monthlyIncomeCurrency: 'EUR',
			monthlyIncomeSource: 'manual',
		});
	});
});
