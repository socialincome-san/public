const mockGetSessionByType = jest.fn();
const mockDownloadDonationCertificateForUser = jest.fn();

jest.mock('@/modules/auth/session.service', () => ({
	getSessionByType: mockGetSessionByType,
}));

jest.mock('@/modules/donation-certificates/donation-certificate.service', () => ({
	downloadDonationCertificateForUser: mockDownloadDonationCertificateForUser,
}));

import { GET } from './route';

describe('donation certificate download route', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('requires an authenticated portal user', async () => {
		mockGetSessionByType.mockResolvedValue({ success: false, error: 'Not authenticated' });

		const response = await GET(new Request('https://example.org'), {
			params: Promise.resolve({ certificateId: 'certificate-1' }),
		});

		expect(response.status).toBe(401);
		expect(mockDownloadDonationCertificateForUser).not.toHaveBeenCalled();
	});

	test('returns the PDF only after the service authorizes the certificate', async () => {
		mockGetSessionByType.mockResolvedValue({ success: true, data: { id: 'user-1' } });
		mockDownloadDonationCertificateForUser.mockResolvedValue({
			success: true,
			data: { contents: Buffer.from('%PDF-1.7'), filename: 'donation-certificate-2025.pdf' },
		});

		const response = await GET(new Request('https://example.org'), {
			params: Promise.resolve({ certificateId: 'certificate-1' }),
		});

		expect(mockDownloadDonationCertificateForUser).toHaveBeenCalledWith('user-1', 'certificate-1');
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('application/pdf');
		expect(response.headers.get('Content-Disposition')).toBe('inline; filename="donation-certificate-2025.pdf"');
		expect(await response.text()).toBe('%PDF-1.7');
	});

	test("does not reveal certificates outside the user's operated programs", async () => {
		mockGetSessionByType.mockResolvedValue({ success: true, data: { id: 'user-1' } });
		mockDownloadDonationCertificateForUser.mockResolvedValue({
			success: false,
			error: 'Donation certificate not found',
		});

		const response = await GET(new Request('https://example.org'), {
			params: Promise.resolve({ certificateId: 'certificate-1' }),
		});

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({ error: 'Donation certificate not found' });
	});

	test('rejects malformed certificate ids before querying storage', async () => {
		mockGetSessionByType.mockResolvedValue({ success: true, data: { id: 'user-1' } });

		const response = await GET(new Request('https://example.org'), {
			params: Promise.resolve({ certificateId: 'x'.repeat(129) }),
		});

		expect(response.status).toBe(404);
		expect(mockDownloadDonationCertificateForUser).not.toHaveBeenCalled();
	});
});
