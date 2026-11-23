const mockRequireSession = jest.fn();
const mockDownloadDonationCertificateForUser = jest.fn();

jest.mock('@/server/session', () => ({
	requireSession: mockRequireSession,
}));

jest.mock('@/modules/donation-certificates/donation-certificate.service', () => ({
	downloadDonationCertificateForUser: mockDownloadDonationCertificateForUser,
}));

import { GET } from './route';

describe('donation certificate download route', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockRequireSession.mockResolvedValue({ id: 'user-1' });
	});

	test('requires a portal user session', async () => {
		mockRequireSession.mockRejectedValue(new Error('NEXT_REDIRECT'));

		await expect(
			GET(new Request('https://example.org'), { params: Promise.resolve({ certificateId: 'certificate-1' }) }),
		).rejects.toThrow('NEXT_REDIRECT');
		expect(mockRequireSession).toHaveBeenCalledWith('user');
		expect(mockDownloadDonationCertificateForUser).not.toHaveBeenCalled();
	});

	test('returns the PDF only after the service authorizes the certificate', async () => {
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
		mockDownloadDonationCertificateForUser.mockResolvedValue({
			success: false,
			error: 'Donation certificate not found',
			status: 404,
		});

		const response = await GET(new Request('https://example.org'), {
			params: Promise.resolve({ certificateId: 'certificate-1' }),
		});

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({ error: 'Donation certificate not found' });
	});
});
