import type Stripe from 'stripe';
import { type ServiceResult } from '../core/base.types';
import { resultFail, resultOk } from '../core/service-result';
import { normalizeCheckoutEmail } from './wizard-embedded-checkout';

export const assertEmbeddedCheckoutSessionPaid = (session: Stripe.Checkout.Session): ServiceResult<void> => {
	if (session.ui_mode !== 'embedded_page') {
		return resultFail('Invalid checkout session type');
	}

	if (session.status !== 'complete') {
		return resultFail('Checkout session is not complete');
	}

	if (session.payment_status !== 'paid') {
		return resultFail('Checkout session is not paid');
	}

	return resultOk(undefined);
};

export const assertContributorEmailMatchesCheckout = (
	session: Stripe.Checkout.Session,
	userEmail: string,
): ServiceResult<string> => {
	const sessionEmail = session.customer_details?.email;
	if (!sessionEmail) {
		return resultOk(normalizeCheckoutEmail(userEmail));
	}

	const normalizedSessionEmail = normalizeCheckoutEmail(sessionEmail);
	const normalizedUserEmail = normalizeCheckoutEmail(userEmail);

	if (normalizedSessionEmail !== normalizedUserEmail) {
		return resultFail('Email does not match checkout session');
	}

	return resultOk(normalizedUserEmail);
};
