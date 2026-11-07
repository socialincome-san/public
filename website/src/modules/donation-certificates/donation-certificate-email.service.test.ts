const mockFindDonationCertificatesForYear = jest.fn();
const mockHasSentMailToWithSubject = jest.fn();
const mockSendMail = jest.fn();

jest.mock('./donation-certificate.repository.read', () => ({
	findDonationCertificatesForYear: mockFindDonationCertificatesForYear,
}));

jest.mock('@/modules/mail/mail.service', () => ({
	hasSentMailToWithSubject: mockHasSentMailToWithSubject,
	sendMail: mockSendMail,
}));

jest.mock('@/lib/i18n/utils', () => ({
	defaultCurrency: 'USD',
	defaultLanguage: 'en',
	getWebsiteBasePath: (language: string, currency: string) => `/${language}/${currency.toLowerCase()}`,
}));

import { sendDonationCertificateReadyEmails } from './donation-certificate-email.service';

describe('donation certificate email service', () => {
	const originalBaseUrl = process.env.BASE_URL;

	beforeEach(() => {
		jest.clearAllMocks();
		process.env.BASE_URL = 'https://socialincome.org';
		mockFindDonationCertificatesForYear.mockResolvedValue([
			{
				contributorId: 'contributor-1',
				contributor: { contact: { firstName: 'Ada', email: 'ada@example.com' } },
			},
		]);
		mockHasSentMailToWithSubject.mockResolvedValue({ success: true, data: false });
		mockSendMail.mockResolvedValue({ success: true, data: undefined });
	});

	afterEach(() => {
		process.env.BASE_URL = originalBaseUrl;
	});

	test('emails each donor a link to their private certificate list', async () => {
		mockFindDonationCertificatesForYear.mockResolvedValue([
			{
				contributorId: 'contributor-1',
				contributor: { contact: { firstName: 'Ada', email: 'ada@example.com' } },
			},
			{
				contributorId: 'contributor-1',
				contributor: { contact: { firstName: 'Ada', email: 'ada@example.com' } },
			},
		]);

		await expect(sendDonationCertificateReadyEmails(2025)).resolves.toEqual({
			success: true,
			data: { sentCount: 1, skippedCount: 0 },
		});
		expect(mockFindDonationCertificatesForYear).toHaveBeenCalledWith(2025);
		expect(mockHasSentMailToWithSubject).toHaveBeenCalledWith(
			'ada@example.com',
			'Your 2025 Social Income donation certificate is ready',
		);
		expect(mockSendMail).toHaveBeenCalledWith({
			to: 'ada@example.com',
			subject: 'Your 2025 Social Income donation certificate is ready',
			text: 'Hello Ada,\n\nYour donation certificate for 2025 is ready. Sign in to your Social Income account to view and download it:\nhttps://socialincome.org/en/usd/dashboard/donation-certificates?search=2025',
		});
		expect(mockSendMail).toHaveBeenCalledTimes(1);
	});

	test('does not resend an email for the same recipient and year', async () => {
		mockHasSentMailToWithSubject.mockResolvedValue({ success: true, data: true });

		await expect(sendDonationCertificateReadyEmails(2025)).resolves.toEqual({
			success: true,
			data: { sentCount: 0, skippedCount: 1 },
		});
		expect(mockSendMail).not.toHaveBeenCalled();
	});

	test('skips contributors without an email address', async () => {
		mockFindDonationCertificatesForYear.mockResolvedValue([
			{
				contributorId: 'contributor-1',
				contributor: { contact: { firstName: 'Ada', email: null } },
			},
		]);

		await expect(sendDonationCertificateReadyEmails(2025)).resolves.toEqual({
			success: true,
			data: { sentCount: 0, skippedCount: 1 },
		});
		expect(mockHasSentMailToWithSubject).not.toHaveBeenCalled();
	});

	test('returns a failure if the site base URL is missing', async () => {
		delete process.env.BASE_URL;

		await expect(sendDonationCertificateReadyEmails(2025)).resolves.toEqual({
			success: false,
			error: 'Missing BASE_URL',
		});
		expect(mockFindDonationCertificatesForYear).not.toHaveBeenCalled();
	});

	test('returns a failure so the scheduled job retries unsent certificates', async () => {
		mockSendMail.mockResolvedValue({ success: false, error: 'Could not send email' });

		await expect(sendDonationCertificateReadyEmails(2025)).resolves.toEqual({
			success: false,
			error: 'Could not send all donation certificate emails',
		});
	});
});
