'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { services } from '@/lib/services/services';
import { type UpdateContributorAfterCheckoutInput } from '@/lib/services/stripe/legacy/legacy-stripe.types';
import { getOptionalContributor } from '../firebase/current-contributor';

export const createStripeCheckoutAction = async (input: {
	amount: number;
	intervalCount?: number;
	currency?: string;
	successUrl: string;
	recurring?: boolean;
	campaignId?: string;
}) => {
	const contributor = await getOptionalContributor();

	return services.stripeLegacy.createHostedCheckoutSession({
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
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.stripeLegacy.createPortalProgramDonationCheckout(sessionResult.data.id, input);
};

export const updateContributorAfterCheckoutAction = async (input: UpdateContributorAfterCheckoutInput) => {
	return services.stripeLegacy.updateContributorAfterCheckout(input);
};
