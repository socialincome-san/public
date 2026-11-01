import { getInitialDonationContext, type DonationAmountContext } from '../utils/donation-amount';
import { wizardContextFromResumedDonation } from './donation-machine-logic';

const context: DonationAmountContext = {
	...getInitialDonationContext('CHF'),
	selectedAmount: 100,
	cadence: 'one-time',
	paymentMethod: 'qr',
	coverTransactionCosts: false,
	oneTimePlanChoice: 'monthly-half',
	returnsToOneTimePlanStep: true,
};

describe('wizardContextFromResumedDonation', () => {
	test('reopens the step it was left on with the same choices', () => {
		expect(wizardContextFromResumedDonation(context, 'stepPlanOneTime')).toMatchObject({
			...context,
			pendingStep: 'stepPlanOneTime',
			wizardPaymentSource: null,
		});
	});

	test('reopens the card checkout ready to request its Stripe session', () => {
		expect(wizardContextFromResumedDonation({ ...context, paymentMethod: 'online' }, 'stepStripeCheckout')).toMatchObject({
			pendingStep: 'stepStripeCheckout',
			paymentMethod: 'online',
			wizardPaymentSource: 'stripe',
			stripeCheckoutStatus: 'loading',
		});
	});

	test('reopens the QR contact step as a QR payment', () => {
		expect(wizardContextFromResumedDonation(context, 'stepQrContact')).toMatchObject({
			pendingStep: 'stepQrContact',
			wizardPaymentSource: 'qr',
			qrDonor: null,
		});
	});
});
