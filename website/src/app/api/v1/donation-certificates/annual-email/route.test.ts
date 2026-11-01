const mockNow = jest.fn();
const mockSendDonationCertificateReadyEmails = jest.fn();
const mockSendSlackAlert = jest.fn();

jest.mock('@/lib/utils/now', () => ({
	now: mockNow,
}));

jest.mock('@/modules/donation-certificates/donation-certificate-email.service', () => ({
	sendDonationCertificateReadyEmails: mockSendDonationCertificateReadyEmails,
}));

jest.mock('@/lib/utils/slack-alert', () => ({
	sendSlackAlert: mockSendSlackAlert,
}));

jest.mock('@/server/scheduler-auth', () => ({
	withSchedulerAuth: (handler: (...args: never[]) => Promise<Response>) => handler,
}));

import { NextRequest } from 'next/server';
import { GET } from './route';

describe('annual donation certificate email route', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('sends the previous year certificates during January', async () => {
		mockNow.mockReturnValue(new Date('2026-01-05T08:00:00.000Z'));
		mockSendDonationCertificateReadyEmails.mockResolvedValue({
			success: true,
			data: { sentCount: 2, skippedCount: 1 },
		});

		const response = await GET(new NextRequest('https://example.org/api/v1/donation-certificates/annual-email'));

		expect(response.status).toBe(201);
		expect(await response.json()).toEqual({ sentCount: 2, skippedCount: 1 });
		expect(mockSendDonationCertificateReadyEmails).toHaveBeenCalledWith(2025);
	});

	test('does not send outside January', async () => {
		mockNow.mockReturnValue(new Date('2026-02-01T08:00:00.000Z'));

		const response = await GET(new NextRequest('https://example.org/api/v1/donation-certificates/annual-email'));

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ skipped: true });
		expect(mockSendDonationCertificateReadyEmails).not.toHaveBeenCalled();
	});
});
