import { getInitialDonationContext, type DonationAmountContext } from '@/components/donation-wizard/utils/donation-amount';
import { PrismaClient } from '@/generated/prisma/client';
import { generateQrBillPdfBuffer } from '@/lib/utils/qr-bill-pdf';
import type { CampaignReadService } from '@/modules/campaigns/campaign.types';
import { findContributorsByPaymentReferenceIds } from '@/modules/contributors/contributor.service';
import type { ExchangeRateReadService } from '@/modules/exchange-rates/exchange-rate.types';
import { QrBillService } from './qr-bill.service';

jest.mock('@/generated/prisma/client', () => ({
	PrismaClient: class {},
	ContributionStatus: {},
	CountryCode: {},
	Currency: { CHF: 'CHF', EUR: 'EUR' },
	PaymentEventType: {},
	SubscriptionPaymentMethod: { bank_transfer: 'bank_transfer' },
	SubscriptionStatus: { active: 'active' },
}));

jest.mock('@/lib/utils/qr-bill-pdf', () => ({
	generateQrBillPdfBuffer: jest.fn(),
}));

jest.mock('@/modules/contributions/contribution.service', () => ({
	upsertFromBankTransfer: jest.fn(),
}));

jest.mock('@/modules/contributors/contributor.service', () => ({
	findContributorsByPaymentReferenceIds: jest.fn(),
	getOrCreateContributorByReferenceId: jest.fn(),
	getOrCreateReferenceIdByEmail: jest.fn(),
	updateContributorSelf: jest.fn(),
}));

jest.mock('@/modules/subscriptions/subscription.service', () => ({
	upsertFromBankStandingOrder: jest.fn(),
}));

const withContext = (overrides: Partial<DonationAmountContext>): DonationAmountContext => ({
	...getInitialDonationContext(),
	paymentMethod: 'qr',
	selectedAmount: 50,
	...overrides,
});

describe('QrBillService.downloadQrBillPdf', () => {
	const generatePdf = generateQrBillPdfBuffer as jest.MockedFunction<typeof generateQrBillPdfBuffer>;
	const mockFindContributorsByPaymentReferenceIds = findContributorsByPaymentReferenceIds as jest.Mock;

	const createService = () =>
		new QrBillService({} as PrismaClient, {} as CampaignReadService, {} as ExchangeRateReadService);

	beforeEach(() => {
		jest.clearAllMocks();
		mockFindContributorsByPaymentReferenceIds.mockResolvedValue({
			success: true,
			data: [{ contact: { email: 'donor@example.com', address: null } }],
		});
		generatePdf.mockResolvedValue(Buffer.from('pdf'));
	});

	test('resolves the amount from wizard context instead of a client-supplied number', async () => {
		const result = await createService().downloadQrBillPdf({
			wizardContext: withContext({ selectedAmount: 50 }),
			contributorReferenceId: 'ref-contributor',
			contributionReferenceId: 'ref-contribution',
			expectedEmail: 'donor@example.com',
			currency: 'CHF',
		});

		expect(result.success).toBe(true);
		expect(generatePdf).toHaveBeenCalledWith({
			amount: 50,
			contributorReferenceId: 'ref-contributor',
			contributionReferenceId: 'ref-contribution',
			currency: 'CHF',
		});
	});

	test('rejects amounts above the wizard cap', async () => {
		const result = await createService().downloadQrBillPdf({
			wizardContext: withContext({
				selectedAmount: 'other',
				customAmount: 1_000_001,
			}),
			contributorReferenceId: 'ref-contributor',
			contributionReferenceId: 'ref-contribution',
			expectedEmail: 'donor@example.com',
			currency: 'CHF',
		});

		expect(result.success).toBe(false);
		expect(generatePdf).not.toHaveBeenCalled();
	});
});
