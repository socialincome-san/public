'use server';

import { getServices } from '@/lib/services/services';
import { UpdateContributorAfterCheckoutInput } from '@/lib/services/stripe/stripe.types';
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
	return getServices().stripe.createCheckoutSession({
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
	return getServices().stripe.createPortalProgramDonationCheckout(user.id, input);
};

export const updateContributorAfterCheckoutAction = async (input: UpdateContributorAfterCheckoutInput) => {
	return getServices().stripe.updateContributorAfterCheckout(input);
};
