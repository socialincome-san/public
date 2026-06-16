'use server';

import { type DonationAmountContext } from '@/components/donation-wizard/utils/donation-amount';
import { getSessionByType } from '@/lib/firebase/current-account';
import { services } from '@/lib/services/services';
import {
	type PortalProgramDonationCheckoutInput,
	type UpdateContributorAfterCheckoutInput,
	type UpdateContributorReferralAfterCheckoutInput,
} from '@/lib/services/stripe/stripe.types';
import { getOptionalContributor } from '../firebase/current-contributor';

export const createPortalProgramDonationCheckoutAction = async (input: PortalProgramDonationCheckoutInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.stripe.createPortalProgramDonationCheckout(sessionResult.data.id, input);
};

export const createStripeEmbeddedCheckoutAction = async (input: {
	wizardContext: DonationAmountContext;
	currency?: string;
}) => {
	const contributor = await getOptionalContributor();

	return services.stripe.createEmbeddedCheckoutSession({
		wizardContext: input.wizardContext,
		currency: input.currency,
		stripeCustomerId: contributor?.stripeCustomerId ?? null,
	});
};

export const getStripeCheckoutOnboardingPrefillAction = async (sessionId: string) => {
	return services.stripe.getCheckoutOnboardingPrefill(sessionId);
};

export const updateContributorAfterWizardCheckoutAction = async (input: UpdateContributorAfterCheckoutInput) => {
	return services.stripe.updateContributorAfterCheckout(input);
};

export const updateContributorReferralAfterWizardCheckoutAction = async (
	input: UpdateContributorReferralAfterCheckoutInput,
) => {
	return services.stripe.updateContributorReferralAfterCheckout(input);
};
