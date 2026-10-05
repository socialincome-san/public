'use server';

import { resultFail, type Result } from '@/lib/result';
import { getOptionalContributor, getSessionByType } from '@/modules/auth/session.service';
import type { ContributorRecord } from '@/modules/contributors/contributor.types';
import type {
	StripeCheckoutOnboardingPrefill,
	StripeEmbeddedCheckoutResult,
} from '@/modules/stripe-payments/stripe-payment.types';
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

export const createPortalProgramDonationCheckoutAction = async (input: unknown): Promise<Result<string>> => {
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

export const createStripeEmbeddedCheckoutAction = async (input: unknown): Promise<Result<StripeEmbeddedCheckoutResult>> => {
	const parsed = stripeEmbeddedCheckoutActionSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid Stripe checkout input');
	}

	const contributorResult = await getOptionalContributor();
	const contributor = contributorResult.success ? contributorResult.data : null;

	return createEmbeddedCheckoutSession({
		wizardContext: parsed.data.wizardContext,
		currency: parsed.data.currency,
		returnPath: parsed.data.returnPath,
		stripeCustomerId: contributor?.stripeCustomerId ?? null,
	});
};

export const getStripeCheckoutOnboardingPrefillAction = async (
	sessionId: unknown,
): Promise<Result<StripeCheckoutOnboardingPrefill>> => {
	const parsed = stripeCheckoutSessionIdSchema.safeParse(sessionId);
	if (!parsed.success) {
		return resultFail('Missing checkout session id');
	}

	return getCheckoutOnboardingPrefill(parsed.data);
};

export const updateContributorAfterWizardCheckoutAction = async (input: unknown): Promise<Result<ContributorRecord>> => {
	const parsed = updateContributorAfterCheckoutSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid contributor checkout update');
	}

	return updateContributorAfterCheckout(parsed.data);
};

export const updateContributorReferralAfterWizardCheckoutAction = async (
	input: unknown,
): Promise<Result<ContributorRecord>> => {
	const parsed = updateContributorReferralAfterCheckoutSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid contributor referral update');
	}

	return updateContributorReferralAfterCheckout(parsed.data);
};
