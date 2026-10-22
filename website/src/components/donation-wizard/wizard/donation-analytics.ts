import type { PaidCheckoutDonation } from '@/modules/stripe-payments/stripe-payment.types';
import { type Cadence, type PaymentMethod, getDonationDisplayAmount } from '../utils/donation-amount';
import type { DonationWizardContext } from './donation-wizard-context';
import type { DonationWizardSend } from './types';

type DonationWizardEventType = Parameters<DonationWizardSend>[0]['type'];

// Event names are the Custom Event triggers in Google Tag Manager (GTM-M38KPW6).
const funnelEventNames: Partial<Record<DonationWizardEventType, string>> = {
	OPEN_FROM_FORM: 'donation_amount_confirmed',
	SUBMIT: 'donation_amount_confirmed',
	PROCEED_TO_PAYMENT: 'donation_payment_method_click',
	START_STRIPE_CHECKOUT: 'donation_online_payment_click',
	START_QR_FLOW: 'donation_qr_generated',
	QR_PAYMENT_CONFIRMED: 'donation_qr_payment_confirmed',
	DONATION_ONBOARDING_PERSONAL_COMPLETE: 'donation_account_confirmed',
};

// Before this, the payment method is only the preselected default.
const eventsWithPaymentMethod = new Set<DonationWizardEventType>([
	'START_STRIPE_CHECKOUT',
	'START_QR_FLOW',
	'QR_PAYMENT_CONFIRMED',
	'DONATION_ONBOARDING_PERSONAL_COMPLETE',
]);

const toDonationType = (cadence: Cadence) => (cadence === 'monthly' ? 'recurring' : 'one_time');

const toPaymentMethod = (paymentMethod: PaymentMethod) => (paymentMethod === 'online' ? 'credit_card' : 'qr');

/** The funnel event for a wizard event that changed the step, or `null` for any other event. */
export const getDonationFunnelEvent = (
	eventType: DonationWizardEventType,
	changedStep: boolean,
	context: DonationWizardContext,
	currency: string,
) => {
	const name = funnelEventNames[eventType];
	if (!name || !changedStep) {
		return null;
	}

	// After payment the summary holds what was charged; the amount fields may be defaults after a Stripe redirect.
	const summary = context.completedDonationSummary;

	return {
		name,
		properties: {
			value: summary?.amount ?? getDonationDisplayAmount(context),
			currency,
			donation_type: toDonationType(summary?.cadence ?? context.cadence),
			// Pushed even when unknown: Tag Manager would otherwise keep the value of an earlier event.
			payment_method: eventsWithPaymentMethod.has(eventType) ? toPaymentMethod(context.paymentMethod) : undefined,
		},
	};
};

export const getDonationCompletedEvent = (donation: PaidCheckoutDonation) => ({
	name: 'donation_completed',
	properties: {
		value: donation.amount,
		currency: donation.currency,
		donation_type: donation.recurring ? 'recurring' : 'one_time',
		payment_method: 'credit_card',
		// Pushed even when unknown: Tag Manager would otherwise keep the value of an earlier event.
		donor_status: donation.donorStatus,
		transaction_id: donation.checkoutSessionId,
		items: [{ item_id: 'donation', item_name: 'Donation', price: donation.amount, quantity: 1 }],
	},
});

/** Properties of the donation bar events, shaped like the funnel events so they can be compared. */
export const getDonationBarEventProperties = (
	value: number,
	currency: string,
	cadence: Cadence,
	paymentMethod?: string,
) => ({
	value,
	currency,
	donation_type: toDonationType(cadence),
	// Pushed even when unknown: Tag Manager would otherwise keep the value of an earlier event.
	payment_method: paymentMethod,
});
