const mockGetSessionByType = jest.fn();
const mockCreateWizardQrBill = jest.fn();
const mockDownloadSubscriptionQrBillPdf = jest.fn();

jest.mock('next/cache', () => ({
	revalidatePath: jest.fn(),
}));

jest.mock('@/lib/firebase/current-account', () => ({
	getSessionByType: mockGetSessionByType,
}));

jest.mock('./qr-bill.service', () => ({
	createPendingContributionFromWizard: jest.fn(),
	createWizardQrBill: mockCreateWizardQrBill,
	downloadSubscriptionQrBillPdf: mockDownloadSubscriptionQrBillPdf,
	downloadWizardQrBillPdf: jest.fn(),
	getOnboardingPrefill: jest.fn(),
	getSubscriptionQrBillDisplay: jest.fn(),
	updateContributorAfterQrPayment: jest.fn(),
	updateReferralAfterQrPayment: jest.fn(),
}));

import { createWizardQrBillAction, downloadSubscriptionQrBillPdfAction } from './qr-bill.actions';

describe('QR bill actions', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('rejects an invalid public wizard request before calling the service', async () => {
		const result = await createWizardQrBillAction({ donor: { email: 'invalid' } });

		expect(result).toEqual({ success: false, error: 'Invalid QR bill request', status: undefined });
		expect(mockCreateWizardQrBill).not.toHaveBeenCalled();
	});

	test('requires a contributor session for subscription PDF downloads', async () => {
		mockGetSessionByType.mockResolvedValue({ success: false, error: 'Not authenticated' });

		const result = await downloadSubscriptionQrBillPdfAction('subscription-1');

		expect(result).toEqual({ success: false, error: 'Not authenticated' });
		expect(mockDownloadSubscriptionQrBillPdf).not.toHaveBeenCalled();
	});

	test('validates and forwards an owned subscription PDF request', async () => {
		mockGetSessionByType.mockResolvedValue({
			success: true,
			data: { id: 'contributor-1', type: 'contributor' },
		});
		mockDownloadSubscriptionQrBillPdf.mockResolvedValue({
			success: true,
			data: { pdfBase64: 'cGRm', filename: 'social-income-qr-bill.pdf' },
		});

		const result = await downloadSubscriptionQrBillPdfAction({ subscriptionId: 'subscription-1' });

		expect(result.success).toBe(true);
		expect(mockDownloadSubscriptionQrBillPdf).toHaveBeenCalledWith('contributor-1', 'subscription-1');
	});
});
