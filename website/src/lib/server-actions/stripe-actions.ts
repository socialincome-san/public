'use server';

import { StripeService } from '@/lib/services/stripe/stripe.service';
import { UpdateContributorAfterCheckoutInput } from '@/lib/services/stripe/stripe.types';
import { getAuthenticatedUserOrThrow } from '../firebase/current-user';
import { getOptionalContributor } from '../firebase/current-contributor';

export async function createStripeCheckoutAction(input: {
	amount: number;
	intervalCount?: number;
	currency?: string;
	successUrl: string;
	recurring?: boolean;
	campaignId?: string;
}) {
	const contributor = await getOptionalContributor();
	const stripe = new StripeService();

	return stripe.createCheckoutSession({
		...input,
		stripeCustomerId: contributor?.stripeCustomerId ?? null,
	});
}

export async function createPortalProgramDonationCheckoutAction(input: {
	amount: number;
	programId: string;
	currency?: string;
	intervalCount?: number;
	recurring?: boolean;
}) {
	const user = await getAuthenticatedUserOrThrow();
	const stripe = new StripeService();

	return stripe.createPortalProgramDonationCheckout(user.id, input);
}

export async function updateContributorAfterCheckoutAction(input: UpdateContributorAfterCheckoutInput) {
	const stripeService = new StripeService();
	return stripeService.updateContributorAfterCheckout(input);
}
