import { CountryCode, Currency, NetworkTechnology } from '@/generated/prisma/enums';
import { countryCreateInputSchema, countryUpdateInputSchema } from './country.schemas';

describe('country schemas', () => {
	test('applies defaults and coerces numeric input', () => {
		const result = countryCreateInputSchema.safeParse({
			isoCode: CountryCode.CH,
			currency: Currency.CHF,
			defaultPayoutAmount: '32',
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toMatchObject({
				isActive: false,
				defaultPayoutAmount: 32,
				microfinanceIndex: null,
				cashConditionOverride: false,
				populationCoverage: null,
				networkTechnology: null,
				mobileMoneyProviderIds: [],
				mobileMoneyConditionOverride: false,
				sanctions: [],
			});
		}
	});

	test('requires an id for updates', () => {
		const result = countryUpdateInputSchema.safeParse({
			isoCode: CountryCode.CH,
			currency: Currency.CHF,
			defaultPayoutAmount: 32,
			networkTechnology: NetworkTechnology.g4,
		});

		expect(result.success).toBe(false);
	});
});
