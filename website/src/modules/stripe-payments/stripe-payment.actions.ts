'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { getOptionalContributor } from '@/lib/firebase/current-contributor';
import { resultFail } from '@/lib/service-result';
import {
	portalProgramDonationCheckoutSchema,
	stripeCheckoutSessionIdSchema,
	stripeEmbeddedCheckoutActionSchema,
	updateContributorAfterCheckoutSchema,
	updateContributorReferralAfterCheckoutSchema,
} from './stripe-payment.schemas';
import {
	createEmbeddedCheckoutSession,
	createPortalProgramDonationCheckout,
	getCheckoutOnboardingPrefill,
	updateContributorAfterCheckout,
	updateContributorReferralAfterCheckout,
} from './stripe-payment.service';

export const createPortalProgramDonationCheckoutAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsed = portalProgramDonationCheckoutSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid portal donation checkout input');
	}

	return createPortalProgramDonationCheckout(sessionResult.data.id, parsed.data);
};

export const createStripeEmbeddedCheckoutAction = async (input: unknown) => {
	const parsed = stripeEmbeddedCheckoutActionSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid Stripe checkout input');
	}

	const contributor = await getOptionalContributor();

	return createEmbeddedCheckoutSession({
		wizardContext: parsed.data.wizardContext,
		currency: parsed.data.currency,
		returnPath: parsed.data.returnPath,
		stripeCustomerId: contributor?.stripeCustomerId ?? null,
	});
};

export const getStripeCheckoutOnboardingPrefillAction = async (sessionId: unknown) => {
	const parsed = stripeCheckoutSessionIdSchema.safeParse(sessionId);
	if (!parsed.success) {
		return resultFail('Missing checkout session id');
	}

	return getCheckoutOnboardingPrefill(parsed.data);
};

export const updateContributorAfterWizardCheckoutAction = async (input: unknown) => {
	const parsed = updateContributorAfterCheckoutSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid contributor checkout update');
	}

	return updateContributorAfterCheckout(parsed.data);
};

export const updateContributorReferralAfterWizardCheckoutAction = async (input: unknown) => {
	const parsed = updateContributorReferralAfterCheckoutSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid contributor referral update');
	}

	return updateContributorReferralAfterCheckout(parsed.data);
};
