import { type Contributor, ContributorReferralSource, CountryCode, Currency, Gender } from '@/generated/prisma/client';
import { type BankContributorData } from '../contributor/contributor.types';

export type QrDonorDetails = Pick<BankContributorData, 'email' | 'firstName' | 'lastName' | 'language'>;

export type WizardQrPayment = {
	amount: number;
	currency: Currency;
	referenceId: string;
	interval: number;
	campaignId?: string;
};

export type QrBillReferenceResult = {
	contributorReferenceId: string;
	contributionReferenceId: string;
};

export type QrBillOnboardingPrefill = {
	email?: string;
	firstname?: string;
	lastname?: string;
	country?: CountryCode;
	needsOnboarding: boolean;
};

export type UpdateContributorAfterQrPaymentInput = {
	paymentReferenceId: string;
	expectedEmail: string;
	user: {
		language: string;
		personal: {
			name: string;
			lastname: string;
			gender?: Gender;
			referral?: ContributorReferralSource;
		};
		address: {
			country: CountryCode;
		};
	};
};

export type UpdateContributorAfterQrPaymentResult = Contributor;

export type GetQrOnboardingPrefillInput = {
	paymentReferenceId: string;
	expectedEmail: string;
};

export type UpdateContributorReferralAfterQrPaymentInput = {
	paymentReferenceId: string;
	expectedEmail: string;
	referral: ContributorReferralSource;
};

export type UpdateContributorReferralAfterQrPaymentResult = Contributor;

export type CreateWizardQrReferencesInput = QrDonorDetails;
