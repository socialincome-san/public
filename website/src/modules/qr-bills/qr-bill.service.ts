import { ContributionStatus, CountryCode, Currency, PaymentEventType } from '@/generated/prisma/enums';
import { buildQrBillDisplayData, generateQrBillPdf, generateQrBillSvg } from '@/integrations/qr-bills/qr-bill.integration';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { nowMs } from '@/lib/utils/now';
import { getCampaignById, getFallbackCampaign } from '@/modules/campaigns/campaign.service';
import {
	getContributorContributionSummary,
	isPaymentTransactionIdTaken,
	upsertFromBankTransfer,
} from '@/modules/contributions/contribution.service';
import type { BankTransferUpsertInput } from '@/modules/contributions/contribution.types';
import {
	findContributorsByPaymentReferenceIds,
	getOrCreateContributorByReferenceId,
	getOrCreateReferenceIdByEmail,
	getOwnedPaymentReferenceId,
	updateContributorSelf,
} from '@/modules/contributors/contributor.service';
import type {
	BankContributorData,
	ContributorRecord,
	ContributorWithContact,
} from '@/modules/contributors/contributor.types';
import { getLatestRates } from '@/modules/exchange-rates/exchange-rate.service';
import {
	getOwnedActiveBankTransferQrBill,
	isBankStandingOrderReferenceTaken,
	upsertFromBankStandingOrder,
} from '@/modules/subscriptions/subscription.service';
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

export const createWizardQrBill = async (
	input: CreateWizardQrBillInput,
	ownerContributorId?: string,
): Promise<Result<WizardQrBillResult>> => {
	const paymentResult = resolveWizardQrPayment(input.wizardContext, input.currency);
	if (!paymentResult.success) {
		return resultFail(paymentResult.error);
	}

	const referencesResult = await getOrCreateQrReferences(input.donor, ownerContributorId);
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
	ownerContributorId?: string,
): Promise<Result<string>> => {
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
		ownerContributorId,
	);
};

export const downloadWizardQrBillPdf = async (
	input: DownloadWizardQrBillPdfInput,
	ownerContributorId?: string,
): Promise<Result<DownloadQrBillPdfResult>> => {
	const contributorResult = await verifyContributorByPaymentReference(
		input.contributorReferenceId,
		input.expectedEmail,
		ownerContributorId,
	);
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
): Promise<Result<QrBillDisplay>> => {
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
): Promise<Result<DownloadQrBillPdfResult>> => {
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

export const getOnboardingPrefill = async (input: GetQrOnboardingPrefillInput): Promise<Result<QrBillOnboardingPrefill>> => {
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
): Promise<Result<ContributorRecord>> => {
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
): Promise<Result<ContributorRecord>> => {
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

export const resolveWizardQrPayment = (context: WizardDonationContextInput, currency?: string): Result<WizardQrPayment> => {
	if (context.paymentMethod !== 'qr') {
		return resultFail('QR payment requires QR payment method');
	}

	const amount = getWizardDonationAmount(context);
	if (amount === null || amount < DONATION_AMOUNT_MIN || amount > DONATION_AMOUNT_MAX) {
		return resultFail('Invalid donation amount');
	}

	const currencyCode = Object.values(Currency).find((candidate) => candidate === (currency ?? 'CHF').toUpperCase());
	if (!currencyCode || !isQrCurrency(currencyCode)) {
		console.warn('Unsupported currency requested for QR bill', { currency });

		return resultFail('Unsupported currency for QR bill');
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
	ownerContributorId?: string,
): Promise<Result<QrBillReferenceResult>> => {
	const referenceResult = await resolveContributorReferenceId(contributorData.email, ownerContributorId);
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

	const contributionReferenceResult = await mintContributionReferenceId();
	if (!contributionReferenceResult.success) {
		return resultFail(contributionReferenceResult.error);
	}

	return resultOk({
		contributorReferenceId: referenceResult.data,
		contributionReferenceId: contributionReferenceResult.data,
	});
};

const CONTRIBUTION_REFERENCE_ID_LENGTH = 10;

const mintContributionReferenceId = async (): Promise<Result<string>> => {
	let candidate = Math.round(nowMs() / 1000);
	for (let attempt = 0; attempt < 100; attempt += 1) {
		const referenceId = String(candidate);
		if (referenceId.length > CONTRIBUTION_REFERENCE_ID_LENGTH) {
			break;
		}

		const [standingOrderTaken, transactionTaken] = await Promise.all([
			isBankStandingOrderReferenceTaken(referenceId),
			isPaymentTransactionIdTaken(referenceId),
		]);
		if (!standingOrderTaken.success) {
			return resultFail(standingOrderTaken.error);
		}
		if (!transactionTaken.success) {
			return resultFail(transactionTaken.error);
		}
		if (!standingOrderTaken.data && !transactionTaken.data) {
			return resultOk(referenceId);
		}

		candidate += 1;
	}

	return resultFail('Could not generate contribution reference');
};

const resolveContributorReferenceId = async (email: string, ownerContributorId?: string): Promise<Result<string>> => {
	if (!ownerContributorId) {
		return getOrCreateReferenceIdByEmail(email);
	}

	const ownedResult = await getOwnedPaymentReferenceId(ownerContributorId, email);
	if (!ownedResult.success) {
		return resultFail(ownedResult.error);
	}
	if (ownedResult.data) {
		return resultOk(ownedResult.data);
	}

	return getOrCreateReferenceIdByEmail(email);
};

const createPendingContribution = async (
	payment: WizardQrPayment,
	userData: BankContributorData,
	ownerContributorId?: string,
): Promise<Result<string>> => {
	try {
		const verifiedContributor = await verifyContributorByPaymentReference(
			userData.paymentReferenceId,
			userData.email,
			ownerContributorId,
		);
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
	ownerContributorId?: string,
): Promise<Result<{ contributor: ContributorWithContact; email: string }>> => {
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

		const wizardAccessResult = await assertUnauthenticatedWizardContributor(contributor, ownerContributorId);
		if (!wizardAccessResult.success) {
			return resultFail(wizardAccessResult.error);
		}

		return resultOk({ contributor, email: normalizedEmail });
	} catch (error) {
		console.error('Could not verify QR bill contributor', { error });

		return resultFail('Could not verify contributor for payment reference');
	}
};

const assertUnauthenticatedWizardContributor = async (
	contributor: ContributorWithContact,
	ownerContributorId?: string,
): Promise<Result<void>> => {
	if (ownerContributorId && contributor.id === ownerContributorId) {
		return resultOk(undefined);
	}

	if (contributor.stripeCustomerId || contributor.legacyFirestoreId) {
		return resultFail('An account already exists for this email. Please sign in.');
	}

	const summaryResult = await getContributorContributionSummary(contributor.id);
	if (!summaryResult.success) {
		return resultFail(summaryResult.error);
	}
	if (summaryResult.data.count > 0) {
		return resultFail('An account already exists for this email. Please sign in.');
	}

	return resultOk(undefined);
};

const resolveCampaignId = async (campaignId?: string): Promise<Result<string>> => {
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
): Promise<Result<BankTransferUpsertInput>> => {
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

const resolveAmountChf = async (amount: number, currency: Currency): Promise<Result<number>> => {
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
		console.error('Missing exchange rate for QR bill', { currency });

		return resultFail('Missing exchange rate for QR bill');
	}

	return resultOk(Math.round((amount / rateCurrency) * rateChf * 100) / 100);
};

const createQrBillDisplay = (input: {
	amount: number;
	contributorReferenceId: string;
	contributionReferenceId: string;
	currency: 'CHF' | 'EUR';
}): Result<QrBillDisplay> => {
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
}): Promise<Result<DownloadQrBillPdfResult>> => {
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
