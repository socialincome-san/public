'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail } from '@/lib/service-result';
import { revalidatePath } from 'next/cache';
import {
	createWizardPendingContributionSchema,
	createWizardQrBillSchema,
	downloadWizardQrBillPdfSchema,
	getQrOnboardingPrefillSchema,
	subscriptionQrBillSchema,
	updateContributorAfterQrPaymentSchema,
	updateContributorReferralAfterQrPaymentSchema,
} from './qr-bill.schemas';
import {
	createPendingContributionFromWizard,
	createWizardQrBill,
	downloadSubscriptionQrBillPdf,
	downloadWizardQrBillPdf,
	getOnboardingPrefill,
	getSubscriptionQrBillDisplay,
	updateContributorAfterQrPayment,
	updateReferralAfterQrPayment,
} from './qr-bill.service';

export const createWizardQrBillAction = async (input: unknown) => {
	const parsed = createWizardQrBillSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid QR bill request');
	}

	return createWizardQrBill(parsed.data);
};

export const createWizardPendingContributionAction = async (input: unknown) => {
	const parsed = createWizardPendingContributionSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid pending contribution request');
	}

	const result = await createPendingContributionFromWizard(parsed.data);
	if (result.success) {
		revalidatePath('/dashboard');
	}

	return result;
};

export const getQrOnboardingPrefillAction = async (input: unknown) => {
	const parsed = getQrOnboardingPrefillSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid QR onboarding request');
	}

	return getOnboardingPrefill(parsed.data);
};

export const updateContributorAfterWizardQrAction = async (input: unknown) => {
	const parsed = updateContributorAfterQrPaymentSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid contributor QR update');
	}

	const result = await updateContributorAfterQrPayment(parsed.data);
	if (result.success) {
		revalidatePath('/dashboard');
	}

	return result;
};

export const updateContributorReferralAfterWizardQrAction = async (input: unknown) => {
	const parsed = updateContributorReferralAfterQrPaymentSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid contributor referral update');
	}

	const result = await updateReferralAfterQrPayment(parsed.data);
	if (result.success) {
		revalidatePath('/dashboard');
	}

	return result;
};

export const downloadQrBillPdfAction = async (input: unknown) => {
	const parsed = downloadWizardQrBillPdfSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid QR bill PDF request');
	}

	return downloadWizardQrBillPdf(parsed.data);
};

export const getSubscriptionQrBillDisplayAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsed = subscriptionQrBillSchema.safeParse(
		typeof input === 'object' && input !== null && 'subscriptionId' in input ? input : { subscriptionId: input },
	);
	if (!parsed.success) {
		return resultFail('Subscription id is required.');
	}

	return getSubscriptionQrBillDisplay(sessionResult.data.id, parsed.data.subscriptionId);
};

export const downloadSubscriptionQrBillPdfAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsed = subscriptionQrBillSchema.safeParse(
		typeof input === 'object' && input !== null && 'subscriptionId' in input ? input : { subscriptionId: input },
	);
	if (!parsed.success) {
		return resultFail('Subscription id is required.');
	}

	return downloadSubscriptionQrBillPdf(sessionResult.data.id, parsed.data.subscriptionId);
};
