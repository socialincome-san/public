import type { WizardDonationContextInput } from './qr-bill.schemas';

const mockGenerateQrBillPdf = jest.fn();
const mockFindContributorsByPaymentReferenceIds = jest.fn();
const mockGetOwnedActiveBankTransferQrBill = jest.fn();

jest.mock('@/integrations/qr-bills/qr-bill.integration', () => ({
	buildQrBillDisplayData: jest.fn(() => ({
		creditor: {
			account: 'CH6730000001151126386',
			address: 'Zweierstrasse',
			buildingNumber: 103,
			zip: 8003,
			city: 'Zürich',
			country: 'CH',
			name: 'Social Income',
		},
		reference: 'reference',
	})),
	generateQrBillSvg: jest.fn(() => '<svg />'),
	generateQrBillPdf: mockGenerateQrBillPdf,
}));

jest.mock('@/modules/campaigns/campaign.service', () => ({
	getCampaignById: jest.fn(),
	getFallbackCampaign: jest.fn(),
}));

jest.mock('@/modules/contributions/contribution.service', () => ({
	upsertFromBankTransfer: jest.fn(),
}));

jest.mock('@/modules/contributors/contributor.service', () => ({
	findContributorsByPaymentReferenceIds: mockFindContributorsByPaymentReferenceIds,
	getOrCreateContributorByReferenceId: jest.fn(),
	getOrCreateReferenceIdByEmail: jest.fn(),
	updateContributorSelf: jest.fn(),
}));

jest.mock('@/modules/exchange-rates/exchange-rate.service', () => ({
	getLatestRates: jest.fn(),
}));

jest.mock('@/modules/subscriptions/subscription.service', () => ({
	getOwnedActiveBankTransferQrBill: mockGetOwnedActiveBankTransferQrBill,
	upsertFromBankStandingOrder: jest.fn(),
}));

import { downloadSubscriptionQrBillPdf, downloadWizardQrBillPdf, resolveWizardQrPayment } from './qr-bill.service';

const wizardContext = (overrides: Partial<WizardDonationContextInput> = {}): WizardDonationContextInput => ({
	monthlyIncome: 5000,
	selectedAmount: 50,
	customAmount: null,
	cadence: 'monthly',
	selectedTier: '1x',
	paymentMethod: 'qr',
	chargeMonthlyHalfOfOneTimeAmount: false,
	...overrides,
});

describe('QR bill service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFindContributorsByPaymentReferenceIds.mockResolvedValue({
			success: true,
			data: [{ contact: { email: 'donor@example.com', address: null } }],
		});
		mockGenerateQrBillPdf.mockResolvedValue({ success: true, data: Buffer.from('pdf') });
	});

	test('derives the PDF amount from validated wizard context', async () => {
		const result = await downloadWizardQrBillPdf({
			wizardContext: wizardContext({ selectedAmount: 50 }),
			contributorReferenceId: '1735689600000',
			contributionReferenceId: '1731700000',
			expectedEmail: 'donor@example.com',
			currency: 'CHF',
		});

		expect(result).toEqual({
			success: true,
			data: {
				pdfBase64: Buffer.from('pdf').toString('base64'),
				filename: 'social-income-qr-bill.pdf',
			},
		});
		expect(mockGenerateQrBillPdf).toHaveBeenCalledWith({
			amount: 50,
			contributorReferenceId: '1735689600000',
			contributionReferenceId: '1731700000',
			currency: 'CHF',
		});
	});

	test('rejects wizard amounts above the cap', () => {
		const result = resolveWizardQrPayment(
			wizardContext({
				selectedAmount: 'other',
				customAmount: 1_000_001,
			}),
			'CHF',
		);

		expect(result).toEqual({ success: false, error: 'Invalid donation amount', status: undefined });
	});

	test('uses the subscriptions service API for an owned QR bill PDF', async () => {
		mockGetOwnedActiveBankTransferQrBill.mockResolvedValue({
			success: true,
			data: {
				amount: 75,
				currency: 'EUR',
				contributorReferenceId: '1735689600000',
				contributionReferenceId: '1731700000',
			},
		});

		const result = await downloadSubscriptionQrBillPdf('contributor-1', 'subscription-1');

		expect(result.success).toBe(true);
		expect(mockGetOwnedActiveBankTransferQrBill).toHaveBeenCalledWith({
			contributorId: 'contributor-1',
			subscriptionId: 'subscription-1',
		});
		expect(mockGenerateQrBillPdf).toHaveBeenCalledWith({
			amount: 75,
			currency: 'EUR',
			contributorReferenceId: '1735689600000',
			contributionReferenceId: '1731700000',
		});
	});
});
