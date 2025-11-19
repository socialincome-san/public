'use server';

import { StripeService } from '@socialincome/shared/src/database/services/stripe/stripe.service';
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
