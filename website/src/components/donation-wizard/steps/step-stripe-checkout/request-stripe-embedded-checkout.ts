import { createStripeEmbeddedCheckoutAction } from '@/lib/server-actions/stripe-wizard-actions';
import type { DonationWizardContext } from '../../wizard/donation-wizard-context';

type StripeCheckoutSend = {
	(event: { type: 'STRIPE_CHECKOUT_READY'; clientSecret: string; sessionId: string; publishableKey: string }): void;
	(event: { type: 'STRIPE_CHECKOUT_ERROR'; message: string }): void;
};

export const requestStripeEmbeddedCheckout = async (
	context: DonationWizardContext,
	currency: string,
	send: StripeCheckoutSend,
) => {
	const result = await createStripeEmbeddedCheckoutAction({
		wizardContext: context,
		currency,
	});

	if (!result.success) {
		send({ type: 'STRIPE_CHECKOUT_ERROR', message: result.error });

		return;
	}

	send({
		type: 'STRIPE_CHECKOUT_READY',
		clientSecret: result.data.clientSecret,
		sessionId: result.data.sessionId,
		publishableKey: result.data.publishableKey,
	});
};
