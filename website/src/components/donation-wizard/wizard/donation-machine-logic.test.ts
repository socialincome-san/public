import { getDonationDisplayAmount, getInitialDonationContext, type DonationAmountContext } from '../utils/donation-amount';
import { wizardContextFromResumedDonation } from './donation-machine-logic';

const withContext = (overrides: Partial<DonationAmountContext>): DonationAmountContext => ({
	...getInitialDonationContext('CHF'),
	selectedAmount: 50,
	paymentMethod: 'online',
	coverTransactionCosts: false,
	...overrides,
});

describe('wizardContextFromResumedDonation', () => {
	test('reopens a monthly donation on the monthly plan step with its tier', () => {
		const context = wizardContextFromResumedDonation(withContext({ cadence: 'monthly', selectedTier: '2x' }));

		expect(context.pendingStep).toBe('stepPlanMonthly');
		expect(getDonationDisplayAmount(context)).toBe(100);
	});

	test('reopens a one-time donation on the one-time plan step', () => {
		const context = wizardContextFromResumedDonation(
			withContext({ cadence: 'one-time', returnsToOneTimePlanStep: true, oneTimePlanChoice: 'one-time' }),
		);

		expect(context.pendingStep).toBe('stepPlanOneTime');
		expect(getDonationDisplayAmount(context)).toBe(50);
	});

	test('reopens half of a one-time amount monthly on the one-time plan step with that choice selected', () => {
		const context = wizardContextFromResumedDonation(
			withContext({
				selectedAmount: 100,
				cadence: 'monthly',
				chargeMonthlyHalfOfOneTimeAmount: true,
				returnsToOneTimePlanStep: true,
				oneTimePlanChoice: 'monthly-half',
			}),
		);

		expect(context).toMatchObject({
			pendingStep: 'stepPlanOneTime',
			cadence: 'one-time',
			chargeMonthlyHalfOfOneTimeAmount: false,
			oneTimePlanChoice: 'monthly-half',
		});
	});
});
