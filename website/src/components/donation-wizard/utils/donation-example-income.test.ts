import {
	convertDonationIncomeCurrency,
	getDonationExampleCountryCodes,
	getDonationExampleIncome,
	isDonationExampleCountryCode,
} from './donation-example-income';

describe('donation-example-income', () => {
	test('rounds the base wage before converting it to the selected website currency', () => {
		expect(getDonationExampleIncome('CH', 'CHF')?.monthlyIncome).toBe(8000);
		expect(getDonationExampleIncome('CH', 'EUR')?.monthlyIncome).toBe(8400);
		expect(getDonationExampleIncome('CH', 'USD')?.monthlyIncome).toBe(9090);
	});

	test('returns wage source metadata and non-mean reference years', () => {
		expect(getDonationExampleIncome('LI', 'CHF')).toMatchObject({
			monthlyIncome: 7000,
			metric: 'median',
			wageYear: 2024,
		});
		expect(getDonationExampleIncome('TR', 'CHF')).toMatchObject({
			wageYear: 2023,
			conversionYear: 2023,
		});
		expect(getDonationExampleIncome('TR', 'EUR')?.monthlyIncome).toBe(1240);
	});

	test('supports Kosovo without adding it to the generated country enum', () => {
		expect(isDonationExampleCountryCode('XK')).toBe(true);
		expect(getDonationExampleIncome('XK', 'CHF')?.monthlyIncome).toBe(600);
	});

	test('does not invent an income example for a country without reference data', () => {
		expect(isDonationExampleCountryCode('US')).toBe(true);
		expect(getDonationExampleIncome('US', 'USD')).toBeNull();
		expect(getDonationExampleIncome(null, 'USD')).toBeNull();
		expect(getDonationExampleIncome('RU', 'USD')).toBeNull();
		expect(getDonationExampleIncome('MC', 'CHF')).toBeNull();
		expect(getDonationExampleIncome('SM', 'EUR')).toBeNull();
		expect(getDonationExampleIncome('VA', 'USD')).toBeNull();
	});

	test('provides a CHF, EUR and USD example for every configured country', () => {
		const countryCodes = getDonationExampleCountryCodes();

		expect(countryCodes).toHaveLength(47);
		for (const countryCode of countryCodes) {
			for (const currency of ['CHF', 'EUR', 'USD'] as const) {
				expect(getDonationExampleIncome(countryCode, currency)).not.toBeNull();
			}
		}
	});

	test('converts manual income values between supported currencies', () => {
		expect(convertDonationIncomeCurrency(5000, 'CHF', 'EUR')).toBe(5248);
		expect(convertDonationIncomeCurrency(5000, 'EUR', 'CHF')).toBe(4763.72);
	});
});
