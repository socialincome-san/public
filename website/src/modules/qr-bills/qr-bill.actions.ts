'use server';

import { resultFail, type Result } from '@/lib/result';
import { getSessionByType } from '@/modules/auth/session.service';
import type { ContributorRecord } from '@/modules/contributors/contributor.types';
import type {
	DownloadQrBillPdfResult,
	QrBillDisplay,
	QrBillOnboardingPrefill,
	WizardQrBillResult,
} from '@/modules/qr-bills/qr-bill.types';
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

export const createWizardQrBillAction = async (input: unknown): Promise<Result<WizardQrBillResult>> => {
	const parsed = createWizardQrBillSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid QR bill request');
	}

	return createWizardQrBill(parsed.data, await readOptionalContributorId());
};

export const createWizardPendingContributionAction = async (input: unknown): Promise<Result<string>> => {
	const parsed = createWizardPendingContributionSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid pending contribution request');
	}

	const result = await createPendingContributionFromWizard(parsed.data, await readOptionalContributorId());
	if (result.success) {
		revalidatePath('/dashboard');
	}

	return result;
};

export const getQrOnboardingPrefillAction = async (input: unknown): Promise<Result<QrBillOnboardingPrefill>> => {
	const parsed = getQrOnboardingPrefillSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid QR onboarding request');
	}

	return getOnboardingPrefill(parsed.data);
};

export const updateContributorAfterWizardQrAction = async (input: unknown): Promise<Result<ContributorRecord>> => {
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

export const updateContributorReferralAfterWizardQrAction = async (input: unknown): Promise<Result<ContributorRecord>> => {
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

export const downloadQrBillPdfAction = async (input: unknown): Promise<Result<DownloadQrBillPdfResult>> => {
	const parsed = downloadWizardQrBillPdfSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid QR bill PDF request');
	}

	return downloadWizardQrBillPdf(parsed.data, await readOptionalContributorId());
};

export const getSubscriptionQrBillDisplayAction = async (input: unknown): Promise<Result<QrBillDisplay>> => {
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

export const downloadSubscriptionQrBillPdfAction = async (input: unknown): Promise<Result<DownloadQrBillPdfResult>> => {
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

const readOptionalContributorId = async (): Promise<string | undefined> => {
	const sessionResult = await getSessionByType('contributor');

	return sessionResult.success ? sessionResult.data.id : undefined;
};
