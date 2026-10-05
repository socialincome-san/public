import type { WizardDonationContextInput } from './qr-bill.schemas';

const mockGenerateQrBillPdf = jest.fn();
const mockFindContributorsByPaymentReferenceIds = jest.fn();
const mockGetOwnedActiveBankTransferQrBill = jest.fn();
const mockGetOrCreateReferenceIdByEmail = jest.fn();
const mockGetOrCreateContributorByReferenceId = jest.fn();
const mockUpdateContributorSelf = jest.fn();
const mockGetContributorContributionSummary = jest.fn();
const mockUpsertFromBankStandingOrder = jest.fn();
const mockUpsertFromBankTransfer = jest.fn();
const mockGetFallbackCampaign = jest.fn();

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
	getFallbackCampaign: mockGetFallbackCampaign,
}));

jest.mock('@/modules/contributions/contribution.service', () => ({
	upsertFromBankTransfer: mockUpsertFromBankTransfer,
	getContributorContributionSummary: mockGetContributorContributionSummary,
}));

jest.mock('@/modules/contributors/contributor.service', () => ({
	findContributorsByPaymentReferenceIds: mockFindContributorsByPaymentReferenceIds,
	getOrCreateContributorByReferenceId: mockGetOrCreateContributorByReferenceId,
	getOrCreateReferenceIdByEmail: mockGetOrCreateReferenceIdByEmail,
	updateContributorSelf: mockUpdateContributorSelf,
}));

jest.mock('@/modules/exchange-rates/exchange-rate.service', () => ({
	getLatestRates: jest.fn(),
}));

jest.mock('@/modules/subscriptions/subscription.service', () => ({
	getOwnedActiveBankTransferQrBill: mockGetOwnedActiveBankTransferQrBill,
	upsertFromBankStandingOrder: mockUpsertFromBankStandingOrder,
}));

import {
	createPendingContributionFromWizard,
	createWizardQrBill,
	downloadSubscriptionQrBillPdf,
	downloadWizardQrBillPdf,
	getOnboardingPrefill,
	resolveWizardQrPayment,
	updateContributorAfterQrPayment,
} from './qr-bill.service';

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

const freshWizardContributor = {
	id: 'contributor-new',
	legacyFirestoreId: null,
	accountId: 'account-1',
	contactId: 'contact-1',
	referral: 'other' as const,
	needsOnboarding: true,
	paymentReferenceId: '1735689600000',
	stripeCustomerId: null,
	createdAt: new Date('2026-01-01T00:00:00Z'),
	updatedAt: null,
	contact: {
		id: 'contact-1',
		firstName: 'New',
		lastName: 'Donor',
		callingName: null,
		email: 'donor@example.com',
		gender: null,
		language: null,
		dateOfBirth: null,
		profession: null,
		phoneId: null,
		addressId: null,
		isInstitution: false,
		createdAt: new Date('2026-01-01T00:00:00Z'),
		updatedAt: null,
		address: null,
	},
};

const establishedVictimContributor = {
	...freshWizardContributor,
	id: 'contributor-victim',
	stripeCustomerId: 'cus_victim',
	paymentReferenceId: 'stolen-reference',
	contact: {
		...freshWizardContributor.contact,
		email: 'victim@example.com',
		firstName: 'Victim',
		lastName: 'Donor',
	},
};

describe('QR bill service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFindContributorsByPaymentReferenceIds.mockResolvedValue({
			success: true,
			data: [freshWizardContributor],
		});
		mockGetContributorContributionSummary.mockResolvedValue({
			success: true,
			data: { totalAmountChf: 0, count: 0, firstContributionAt: null },
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

	test('does not return an existing donor payment reference from the wizard', async () => {
		mockGetOrCreateReferenceIdByEmail.mockResolvedValue({
			success: false,
			error: 'An account already exists for this email. Please sign in.',
		});

		const result = await createWizardQrBill({
			wizardContext: wizardContext(),
			donor: {
				email: 'victim@example.com',
				firstName: 'Victim',
				lastName: 'Donor',
				language: 'en',
			},
			currency: 'CHF',
		});

		expect(result).toEqual({
			success: false,
			error: 'An account already exists for this email. Please sign in.',
		});
		expect(mockGetOrCreateContributorByReferenceId).not.toHaveBeenCalled();
	});

	test('blocks prefill and updates when an existing donor reference is stolen', async () => {
		mockFindContributorsByPaymentReferenceIds.mockResolvedValue({
			success: true,
			data: [establishedVictimContributor],
		});

		const prefill = await getOnboardingPrefill({
			paymentReferenceId: 'stolen-reference',
			expectedEmail: 'victim@example.com',
		});
		expect(prefill).toEqual({
			success: false,
			error: 'An account already exists for this email. Please sign in.',
		});

		const update = await updateContributorAfterQrPayment({
			paymentReferenceId: 'stolen-reference',
			expectedEmail: 'victim@example.com',
			user: {
				language: 'en',
				personal: { name: 'Attacker', lastname: 'Name' },
				address: { country: 'CH' },
			},
		});
		expect(update).toEqual({
			success: false,
			error: 'An account already exists for this email. Please sign in.',
		});
		expect(mockUpdateContributorSelf).not.toHaveBeenCalled();
	});

	test('allows a new unused email to mint QR references and create a pending contribution', async () => {
		mockGetOrCreateReferenceIdByEmail.mockResolvedValue({ success: true, data: '1735689600000' });
		mockGetOrCreateContributorByReferenceId.mockResolvedValue({
			success: true,
			data: freshWizardContributor,
		});
		mockGetFallbackCampaign.mockResolvedValue({
			success: true,
			data: { id: 'campaign-1', slug: null, endDate: null, programId: null },
		});
		mockUpsertFromBankStandingOrder.mockResolvedValue({ success: true, data: { id: 'sub-1' } });
		mockUpsertFromBankTransfer.mockResolvedValue({
			success: true,
			data: { id: 'payment-1' },
		});

		const createResult = await createWizardQrBill({
			wizardContext: wizardContext(),
			donor: {
				email: 'new@example.com',
				firstName: 'New',
				lastName: 'Donor',
				language: 'en',
			},
			currency: 'CHF',
		});
		expect(createResult.success).toBe(true);
		if (!createResult.success) {
			throw new Error(createResult.error);
		}
		expect(createResult.data.contributorReferenceId).toBe('1735689600000');

		const pendingResult = await createPendingContributionFromWizard({
			wizardContext: wizardContext(),
			contributionReferenceId: '1731700000',
			userData: {
				email: 'donor@example.com',
				firstName: 'New',
				lastName: 'Donor',
				language: 'en',
				paymentReferenceId: '1735689600000',
			},
			currency: 'CHF',
		});
		expect(pendingResult).toEqual({ success: true, data: 'Contribution created' });
		expect(mockUpsertFromBankStandingOrder).toHaveBeenCalledWith(
			expect.objectContaining({
				bankStandingOrderReference: '1731700000',
				contributorId: 'contributor-new',
			}),
		);
	});
});
