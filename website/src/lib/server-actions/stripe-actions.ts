'use server';

import { UpdateContributorAfterCheckoutInput } from '@/lib/services/stripe/stripe.types';
import { services } from '@/lib/services/services';
import { getOptionalContributor } from '../firebase/current-contributor';
import { getAuthenticatedUserOrThrow } from '../firebase/current-user';

export const createStripeCheckoutAction = async (input: {
	amount: number;
	intervalCount?: number;
	currency?: string;
	successUrl: string;
	recurring?: boolean;
	campaignId?: string;
}) => {
	const contributor = await getOptionalContributor();

	return services.stripe.createCheckoutSession({
		...input,
		stripeCustomerId: contributor?.stripeCustomerId ?? null,
	});
};

export const createPortalProgramDonationCheckoutAction = async (input: {
	amount: number;
	programId: string;
	currency?: string;
	intervalCount?: number;
	recurring?: boolean;
}) => {
	const user = await getAuthenticatedUserOrThrow();

	return services.stripe.createPortalProgramDonationCheckout(user.id, input);
};

export const updateContributorAfterCheckoutAction = async (input: UpdateContributorAfterCheckoutInput) => {
	return services.stripe.updateContributorAfterCheckout(input);
};
