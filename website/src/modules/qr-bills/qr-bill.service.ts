import { ContributionStatus, CountryCode, Currency, PaymentEventType } from '@/generated/prisma/enums';
import { buildQrBillDisplayData, generateQrBillPdf, generateQrBillSvg } from '@/integrations/qr-bills/qr-bill.integration';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { nowMs } from '@/lib/utils/now';
import { getCampaignById, getFallbackCampaign } from '@/modules/campaigns/campaign.service';
import { upsertFromBankTransfer } from '@/modules/contributions/contribution.service';
import type { BankTransferUpsertInput } from '@/modules/contributions/contribution.types';
import {
	findContributorsByPaymentReferenceIds,
	getOrCreateContributorByReferenceId,
	getOrCreateReferenceIdByEmail,
	updateContributorSelf,
} from '@/modules/contributors/contributor.service';
import type {
	BankContributorData,
	ContributorRecord,
	ContributorWithContact,
} from '@/modules/contributors/contributor.types';
import { getLatestRates } from '@/modules/exchange-rates/exchange-rate.service';
import { getOwnedActiveBankTransferQrBill, upsertFromBankStandingOrder } from '@/modules/subscriptions/subscription.service';
import type {
	CreateWizardPendingContributionInput,
	CreateWizardQrBillInput,
	DownloadWizardQrBillPdfInput,
	GetQrOnboardingPrefillInput,
	UpdateContributorAfterQrPaymentInput,
	UpdateContributorReferralAfterQrPaymentInput,
	WizardDonationContextInput,
} from './qr-bill.schemas';
import type {
	DownloadQrBillPdfResult,
	QrBillDisplay,
	QrBillOnboardingPrefill,
	QrBillReferenceResult,
	WizardQrBillResult,
	WizardQrPayment,
} from './qr-bill.types';

const DONATION_MONTHLY_INCOME_MIN = 50;
const DONATION_MONTHLY_INCOME_MAX = 1_000_000;
const DONATION_AMOUNT_MIN = 1;
const DONATION_AMOUNT_MAX = 1_000_000;

export const createWizardQrBill = async (input: CreateWizardQrBillInput): Promise<ServiceResult<WizardQrBillResult>> => {
	const paymentResult = resolveWizardQrPayment(input.wizardContext, input.currency);
	if (!paymentResult.success) {
		return resultFail(paymentResult.error);
	}

	const referencesResult = await getOrCreateQrReferences(input.donor);
	if (!referencesResult.success) {
		return resultFail(referencesResult.error);
	}

	const displayResult = createQrBillDisplay({
		amount: paymentResult.data.amount,
		currency: paymentResult.data.currency,
		...referencesResult.data,
	});
	if (!displayResult.success) {
		return resultFail(displayResult.error);
	}

	return resultOk({
		...referencesResult.data,
		display: displayResult.data,
	});
};

export const createPendingContributionFromWizard = async (
	input: CreateWizardPendingContributionInput,
): Promise<ServiceResult<string>> => {
	const paymentResult = resolveWizardQrPayment(input.wizardContext, input.currency);
	if (!paymentResult.success) {
		return resultFail(paymentResult.error);
	}

	return createPendingContribution(
		{
			...paymentResult.data,
			referenceId: input.contributionReferenceId,
		},
		input.userData,
	);
};

export const downloadWizardQrBillPdf = async (
	input: DownloadWizardQrBillPdfInput,
): Promise<ServiceResult<DownloadQrBillPdfResult>> => {
	const contributorResult = await verifyContributorByPaymentReference(input.contributorReferenceId, input.expectedEmail);
	if (!contributorResult.success) {
		return resultFail(contributorResult.error);
	}

	const paymentResult = resolveWizardQrPayment(input.wizardContext, input.currency);
	if (!paymentResult.success) {
		return resultFail(paymentResult.error);
	}

	return generateQrBillPdfResult({
		amount: paymentResult.data.amount,
		contributorReferenceId: input.contributorReferenceId,
		contributionReferenceId: input.contributionReferenceId,
		currency: paymentResult.data.currency,
	});
};

export const getSubscriptionQrBillDisplay = async (
	contributorId: string,
	subscriptionId: string,
): Promise<ServiceResult<QrBillDisplay>> => {
	const subscriptionResult = await getOwnedActiveBankTransferQrBill({ contributorId, subscriptionId });
	if (!subscriptionResult.success) {
		return resultFail(subscriptionResult.error);
	}

	const { currency } = subscriptionResult.data;
	if (!isQrCurrency(currency)) {
		return resultFail('QR bill is only available for CHF and EUR');
	}

	return createQrBillDisplay({
		...subscriptionResult.data,
		currency,
	});
};

export const downloadSubscriptionQrBillPdf = async (
	contributorId: string,
	subscriptionId: string,
): Promise<ServiceResult<DownloadQrBillPdfResult>> => {
	const subscriptionResult = await getOwnedActiveBankTransferQrBill({ contributorId, subscriptionId });
	if (!subscriptionResult.success) {
		return resultFail(subscriptionResult.error);
	}

	const { currency } = subscriptionResult.data;
	if (!isQrCurrency(currency)) {
		return resultFail('QR bill PDF is only available for CHF and EUR');
	}

	return generateQrBillPdfResult({
		...subscriptionResult.data,
		currency,
	});
};

export const getOnboardingPrefill = async (
	input: GetQrOnboardingPrefillInput,
): Promise<ServiceResult<QrBillOnboardingPrefill>> => {
	const contributorResult = await verifyContributorByPaymentReference(input.paymentReferenceId, input.expectedEmail);
	if (!contributorResult.success) {
		return resultFail(contributorResult.error);
	}

	const { contributor } = contributorResult.data;
	const country = contributor.contact?.address?.country;
	const parsedCountry = Object.values(CountryCode).find((candidate) => candidate === country);

	return resultOk({
		email: contributor.contact?.email ?? undefined,
		firstname: contributor.contact?.firstName ?? undefined,
		lastname: contributor.contact?.lastName ?? undefined,
		country: parsedCountry,
		needsOnboarding: contributor.needsOnboarding,
	});
};

export const updateContributorAfterQrPayment = async (
	input: UpdateContributorAfterQrPaymentInput,
): Promise<ServiceResult<ContributorRecord>> => {
	const { paymentReferenceId, expectedEmail, user } = input;
	const contributorResult = await verifyContributorByPaymentReference(paymentReferenceId, expectedEmail);
	if (!contributorResult.success) {
		return resultFail(contributorResult.error);
	}

	const { contributor, email } = contributorResult.data;

	return updateContributorSelf(contributor.id, {
		...(user.personal.referral !== undefined ? { referral: user.personal.referral } : {}),
		needsOnboarding: false,
		contact: {
			firstName: user.personal.name,
			lastName: user.personal.lastname,
			email,
			gender: user.personal.gender ?? null,
			language: user.language,
			address: {
				country: user.address.country,
			},
		},
	});
};

export const updateReferralAfterQrPayment = async (
	input: UpdateContributorReferralAfterQrPaymentInput,
): Promise<ServiceResult<ContributorRecord>> => {
	const { paymentReferenceId, expectedEmail, referral } = input;
	const contributorResult = await verifyContributorByPaymentReference(paymentReferenceId, expectedEmail);
	if (!contributorResult.success) {
		return resultFail(contributorResult.error);
	}

	const { contributor, email } = contributorResult.data;

	return updateContributorSelf(contributor.id, {
		referral,
		contact: { email },
	});
};

export const resolveWizardQrPayment = (
	context: WizardDonationContextInput,
	currency?: string,
): ServiceResult<WizardQrPayment> => {
	if (context.paymentMethod !== 'qr') {
		return resultFail('QR payment requires QR payment method');
	}

	const amount = getWizardDonationAmount(context);
	if (amount === null || amount < DONATION_AMOUNT_MIN || amount > DONATION_AMOUNT_MAX) {
		return resultFail('Invalid donation amount');
	}

	const currencyCode = Object.values(Currency).find((candidate) => candidate === (currency ?? 'CHF').toUpperCase());
	if (!currencyCode || !isQrCurrency(currencyCode)) {
		return resultFail(`Unsupported currency for QR bill: ${currency ?? ''}`);
	}

	return resultOk({
		amount,
		currency: currencyCode,
		referenceId: '',
		interval: context.cadence === 'monthly' ? 1 : 0,
		campaignId: context.campaignId,
	});
};

const getOrCreateQrReferences = async (
	contributorData: Omit<BankContributorData, 'paymentReferenceId'>,
): Promise<ServiceResult<QrBillReferenceResult>> => {
	const referenceResult = await getOrCreateReferenceIdByEmail(contributorData.email);
	if (!referenceResult.success) {
		return resultFail(referenceResult.error);
	}

	const contributorResult = await getOrCreateContributorByReferenceId({
		...contributorData,
		paymentReferenceId: referenceResult.data,
	});
	if (!contributorResult.success) {
		return resultFail(contributorResult.error);
	}

	return resultOk({
		contributorReferenceId: referenceResult.data,
		contributionReferenceId: Math.round(nowMs() / 1000).toString(),
	});
};

const createPendingContribution = async (
	payment: WizardQrPayment,
	userData: BankContributorData,
): Promise<ServiceResult<string>> => {
	try {
		const verifiedContributor = await verifyContributorByPaymentReference(userData.paymentReferenceId, userData.email);
		if (!verifiedContributor.success) {
			return resultFail(verifiedContributor.error);
		}

		const contributorResult = await getOrCreateContributorByReferenceId(userData);
		if (!contributorResult.success) {
			return resultFail('Could not get or create contributor');
		}

		const campaignIdResult = await resolveCampaignId(payment.campaignId);
		if (!campaignIdResult.success) {
			return resultFail(campaignIdResult.error);
		}

		if (payment.interval === 1) {
			const subscriptionResult = await upsertFromBankStandingOrder({
				bankStandingOrderReference: payment.referenceId,
				contributorId: contributorResult.data.id,
				campaignId: campaignIdResult.data,
				amount: payment.amount,
				currency: payment.currency,
			});
			if (!subscriptionResult.success) {
				return resultFail(subscriptionResult.error);
			}
		}

		const contributionResult = await buildContribution(payment, contributorResult.data.id, campaignIdResult.data);
		if (!contributionResult.success) {
			return resultFail(contributionResult.error);
		}

		const upsertResult = await upsertFromBankTransfer(contributionResult.data);
		if (!upsertResult.success) {
			return resultFail('Could not generate pending contribution');
		}

		return resultOk('Contribution created');
	} catch (error) {
		console.error('Failed to store QR contribution', { error });

		return resultFail('Failed to store contribution');
	}
};

const verifyContributorByPaymentReference = async (
	paymentReferenceId: string,
	expectedEmail: string,
): Promise<ServiceResult<{ contributor: ContributorWithContact; email: string }>> => {
	try {
		const contributorsResult = await findContributorsByPaymentReferenceIds([paymentReferenceId]);
		if (!contributorsResult.success) {
			return resultFail(contributorsResult.error);
		}

		const contributor = contributorsResult.data[0];
		if (!contributor) {
			return resultFail('Contributor not found for payment reference');
		}

		const contributorEmail = contributor.contact?.email;
		if (!contributorEmail) {
			return resultFail('Contributor email is required');
		}

		const normalizedEmail = normalizeEmail(contributorEmail);
		if (normalizedEmail !== normalizeEmail(expectedEmail)) {
			return resultFail('Contributor email does not match QR donor email');
		}

		return resultOk({ contributor, email: normalizedEmail });
	} catch (error) {
		console.error('Could not verify QR bill contributor', { error });

		return resultFail('Could not verify contributor for payment reference');
	}
};

const resolveCampaignId = async (campaignId?: string): Promise<ServiceResult<string>> => {
	if (campaignId) {
		const campaignResult = await getCampaignById(campaignId);
		if (campaignResult.success) {
			return resultOk(campaignResult.data.id);
		}
	}

	const fallbackResult = await getFallbackCampaign();
	if (!fallbackResult.success) {
		return resultFail('Could not get campaign ID');
	}

	return resultOk(fallbackResult.data.id);
};

const buildContribution = async (
	payment: WizardQrPayment,
	contributorId: string,
	campaignId: string,
): Promise<ServiceResult<BankTransferUpsertInput>> => {
	const amountChfResult = await resolveAmountChf(payment.amount, payment.currency);
	if (!amountChfResult.success) {
		return resultFail(amountChfResult.error);
	}

	return resultOk({
		type: PaymentEventType.bank_transfer,
		transactionId: payment.referenceId,
		metadata: { raw_content: '' },
		contribution: {
			amount: payment.amount,
			currency: payment.currency,
			amountChf: amountChfResult.data,
			feesChf: 0,
			status: ContributionStatus.pending,
			campaignId,
			contributorId,
		},
	});
};

const resolveAmountChf = async (amount: number, currency: Currency): Promise<ServiceResult<number>> => {
	if (currency === Currency.CHF) {
		return resultOk(amount);
	}

	const ratesResult = await getLatestRates();
	if (!ratesResult.success) {
		return resultFail(ratesResult.error);
	}

	const rateCurrency = ratesResult.data[currency];
	const rateChf = ratesResult.data.CHF;
	if (!rateCurrency || !rateChf) {
		return resultFail(`Missing exchange rate for ${currency}`);
	}

	return resultOk(Math.round((amount / rateCurrency) * rateChf * 100) / 100);
};

const createQrBillDisplay = (input: {
	amount: number;
	contributorReferenceId: string;
	contributionReferenceId: string;
	currency: 'CHF' | 'EUR';
}): ServiceResult<QrBillDisplay> => {
	try {
		const data = buildQrBillDisplayData(input);

		return resultOk({
			qrBillSvg: generateQrBillSvg(input),
			amount: input.amount,
			currency: input.currency,
			creditor: data.creditor,
			reference: data.reference,
		});
	} catch (error) {
		console.error('Could not generate QR bill display', { error });

		return resultFail('Could not generate QR bill');
	}
};

const generateQrBillPdfResult = async (input: {
	amount: number;
	contributorReferenceId: string;
	contributionReferenceId: string;
	currency: 'CHF' | 'EUR';
}): Promise<ServiceResult<DownloadQrBillPdfResult>> => {
	const pdfResult = await generateQrBillPdf(input);
	if (!pdfResult.success) {
		return resultFail(pdfResult.error);
	}

	return resultOk({
		pdfBase64: pdfResult.data.toString('base64'),
		filename: 'social-income-qr-bill.pdf',
	});
};

const getWizardDonationAmount = (context: WizardDonationContextInput): number | null => {
	const baseAmount = getWizardBaseAmount(context);
	if (baseAmount === null) {
		return null;
	}
	if (context.cadence !== 'monthly') {
		return baseAmount;
	}

	const monthlyAmount = context.chargeMonthlyHalfOfOneTimeAmount ? Math.max(1, Math.round(baseAmount / 2)) : baseAmount;

	return context.selectedTier === '2x' ? monthlyAmount * 2 : monthlyAmount;
};

const getWizardBaseAmount = (context: WizardDonationContextInput): number | null => {
	if (context.selectedAmount === 'other') {
		return isAmountInRange(context.customAmount) ? context.customAmount : null;
	}
	if (context.selectedAmount !== null) {
		return context.selectedAmount;
	}
	if (
		context.monthlyIncome === null ||
		context.monthlyIncome < DONATION_MONTHLY_INCOME_MIN ||
		context.monthlyIncome > DONATION_MONTHLY_INCOME_MAX
	) {
		return null;
	}

	return Math.round(context.monthlyIncome / 100);
};

const isAmountInRange = (amount: number | null): amount is number =>
	amount !== null && amount >= DONATION_AMOUNT_MIN && amount <= DONATION_AMOUNT_MAX;

const isQrCurrency = (currency: Currency): currency is 'CHF' | 'EUR' =>
	currency === Currency.CHF || currency === Currency.EUR;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();
