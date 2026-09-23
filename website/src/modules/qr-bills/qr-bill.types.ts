import type { CountryCode } from '@/generated/prisma/enums';

export type WizardQrPayment = {
	amount: number;
	currency: 'CHF' | 'EUR';
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

export type QrBillDisplay = {
	qrBillSvg: string;
	amount: number;
	currency: 'CHF' | 'EUR';
	creditor: {
		account: string;
		address: string;
		buildingNumber: number;
		zip: number;
		city: string;
		country: string;
		name: string;
	};
	reference: string;
};

export type WizardQrBillResult = QrBillReferenceResult & {
	display: QrBillDisplay;
};

export type DownloadQrBillPdfResult = {
	pdfBase64: string;
	filename: string;
};

export type QrBillReferenceParts = {
	contributorReferenceId: string;
	contributionReferenceId?: string;
};
