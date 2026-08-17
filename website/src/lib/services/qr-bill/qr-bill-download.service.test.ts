import { getInitialDonationContext, type DonationAmountContext } from '@/components/donation-wizard/utils/donation-amount';
import { PrismaClient } from '@/generated/prisma/client';
import { generateQrBillPdfBuffer } from '@/lib/utils/qr-bill-pdf';
import type { CampaignReadService } from '../campaign/campaign-read.service';
import type { ContributionWriteService } from '../contribution/contribution-write.service';
import type { ContributorReadService } from '../contributor/contributor-read.service';
import type { ContributorWriteService } from '../contributor/contributor-write.service';
import type { ExchangeRateReadService } from '../exchange-rate/exchange-rate-read.service';
import type { SubscriptionWriteService } from '../subscription/subscription-write.service';
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

const withContext = (overrides: Partial<DonationAmountContext>): DonationAmountContext => ({
	...getInitialDonationContext(),
	paymentMethod: 'qr',
	selectedAmount: 50,
	...overrides,
});

describe('QrBillService.downloadQrBillPdf', () => {
	const findFirst = jest.fn();
	const generatePdf = generateQrBillPdfBuffer as jest.MockedFunction<typeof generateQrBillPdfBuffer>;

	const createService = () =>
		new QrBillService(
			{ contributor: { findFirst } } as unknown as PrismaClient,
			{} as ContributorWriteService,
			{} as ContributorReadService,
			{} as CampaignReadService,
			{} as ContributionWriteService,
			{} as SubscriptionWriteService,
			{} as ExchangeRateReadService,
			{
				error: jest.fn(),
				warn: jest.fn(),
				info: jest.fn(),
				debug: jest.fn(),
				alert: jest.fn(),
			},
		);

	beforeEach(() => {
		jest.clearAllMocks();
		findFirst.mockResolvedValue({
			contact: { email: 'donor@example.com', address: null },
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
