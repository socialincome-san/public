import { portalProgramDonationCheckoutSchema, stripeEmbeddedCheckoutActionSchema } from './stripe-payment.schemas';

describe('portalProgramDonationCheckoutSchema', () => {
	test('accepts a portal donation payload', () => {
		expect(
			portalProgramDonationCheckoutSchema.parse({
				amount: 5000,
				programId: 'program-1',
				currency: 'CHF',
				recurring: false,
			}),
		).toEqual({
			amount: 5000,
			programId: 'program-1',
			currency: 'CHF',
			recurring: false,
		});
	});

	test('rejects a missing program id', () => {
		expect(portalProgramDonationCheckoutSchema.safeParse({ amount: 5000, programId: '' }).success).toBe(false);
	});
});

describe('stripeEmbeddedCheckoutActionSchema', () => {
	test('accepts a wizard checkout payload', () => {
		const parsed = stripeEmbeddedCheckoutActionSchema.parse({
			wizardContext: {
				monthlyIncome: 5000,
				selectedAmount: 50,
				customAmount: null,
				cadence: 'monthly',
				selectedTier: '1x',
				paymentMethod: 'online',
				chargeMonthlyHalfOfOneTimeAmount: false,
				coverTransactionCosts: true,
				oneTimePlanChoice: 'one-time',
				returnsToOneTimePlanStep: false,
				campaignId: 'campaign-1',
			},
			currency: 'CHF',
			returnPath: '/donate',
		});

		expect(parsed.currency).toBe('CHF');
		expect(parsed.wizardContext.selectedAmount).toBe(50);
	});
});
