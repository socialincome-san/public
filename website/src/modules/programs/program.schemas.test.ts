import { Currency, PayoutInterval, Profile } from '@/generated/prisma/enums';
import { programBudgetCalculationSchema, programCreateSchema, programSettingsUpdateSchema } from './program.schemas';

describe('program schemas', () => {
	it('coerces numeric program creation fields', () => {
		const result = programCreateSchema.safeParse({
			countryId: 'country-1',
			amountOfRecipientsForStart: '10',
			programDurationInMonths: '12',
			payoutPerInterval: '25',
			payoutInterval: PayoutInterval.monthly,
			targetFocuses: ['focus-1'],
			targetProfiles: [Profile.female],
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.amountOfRecipientsForStart).toBe(10);
			expect(result.data.payoutPerInterval).toBe(25);
		}
	});

	it('requires an operator organization for settings updates', () => {
		const result = programSettingsUpdateSchema.safeParse({
			id: 'program-1',
			name: 'Program',
			slug: 'program',
			countryId: 'country-1',
			coveredByReserves: false,
			programDurationInMonths: 12,
			payoutPerInterval: 25,
			payoutInterval: PayoutInterval.monthly,
			targetFocuses: [],
			targetProfiles: [],
			ownerOrganizationIds: [],
			operatorOrganizationIds: [],
		});

		expect(result.success).toBe(false);
	});

	it('validates budget currencies and positive values', () => {
		expect(
			programBudgetCalculationSchema.safeParse({
				amountOfRecipients: 10,
				programDuration: 12,
				defaultPayoutPerInterval: 25,
				payoutPerInterval: 25,
				payoutInterval: PayoutInterval.monthly,
				payoutCurrency: Currency.SLE,
				displayCurrency: Currency.CHF,
			}).success,
		).toBe(true);
	});
});
