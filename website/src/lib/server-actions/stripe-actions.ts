'use server';

import { StripeService } from '@socialincome/shared/src/database/services/stripe/stripe.service';
import { getOptionalContributor } from '../firebase/current-contributor';
import { WebsiteCurrency } from '../i18n/utils';

export type CreateContributorCheckoutSessionInput = {
	amount: number;
	intervalCount?: number;
	currency?: WebsiteCurrency;
	successUrl: string;
	recurring?: boolean;
	campaignId?: string;
};

export async function createStripeCheckoutAction(input: CreateContributorCheckoutSessionInput): Promise<string> {
	const contributor = await getOptionalContributor();

	const stripe = new StripeService();
	const result = await stripe.createCheckoutSession({
		...input,
		stripeCustomerId: contributor?.stripeCustomerId ?? null,
	});

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}
