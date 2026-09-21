const mockSendSendgridEmail = jest.fn();
const mockFindContactIdByEmail = jest.fn();
const mockCreateSentEmail = jest.fn();

jest.mock('@/integrations/sendgrid/sendgrid-mail.integration', () => ({
	sendSendgridEmail: mockSendSendgridEmail,
}));

jest.mock('./mail.repository', () => ({
	findContactIdByEmail: mockFindContactIdByEmail,
	createSentEmail: mockCreateSentEmail,
}));

import { sendMail } from './mail.service';

describe('mail service', () => {
	const originalApiKey = process.env.SENDGRID_API_KEY;
	const originalFromEmail = process.env.SENDGRID_FROM_EMAIL;

	beforeEach(() => {
		jest.clearAllMocks();
		process.env.SENDGRID_API_KEY = 'test-api-key';
		process.env.SENDGRID_FROM_EMAIL = 'sender@example.com';
		mockSendSendgridEmail.mockResolvedValue({ success: true, data: undefined });
		mockFindContactIdByEmail.mockResolvedValue(null);
		mockCreateSentEmail.mockResolvedValue({ id: 'email-1' });
	});

	afterEach(() => {
		process.env.SENDGRID_API_KEY = originalApiKey;
		process.env.SENDGRID_FROM_EMAIL = originalFromEmail;
	});

	test('returns an error when SendGrid configuration is missing', async () => {
		delete process.env.SENDGRID_API_KEY;
		delete process.env.SENDGRID_FROM_EMAIL;

		await expect(
			sendMail({
				to: 'recipient@example.com',
				subject: 'Subject',
				text: 'Body',
			}),
		).resolves.toEqual({
			success: false,
			error: 'Missing required SendGrid environment variables',
		});
		expect(mockSendSendgridEmail).not.toHaveBeenCalled();
	});

	test('sends an email and stores a record for each recipient', async () => {
		const result = await sendMail({
			to: ['one@example.com', 'two@example.com'],
			subject: 'Subject',
			text: 'Body',
		});

		expect(result).toEqual({ success: true, data: undefined });
		expect(mockSendSendgridEmail).toHaveBeenCalledWith({
			to: ['one@example.com', 'two@example.com'],
			from: 'sender@example.com',
			subject: 'Subject',
			text: 'Body',
		});
		expect(mockCreateSentEmail).toHaveBeenCalledTimes(2);
	});

	test('does not store emails when SendGrid fails', async () => {
		mockSendSendgridEmail.mockResolvedValue({ success: false, error: 'Could not send email' });

		await expect(
			sendMail({
				to: 'recipient@example.com',
				subject: 'Subject',
				text: 'Body',
			}),
		).resolves.toEqual({ success: false, error: 'Could not send email' });
		expect(mockCreateSentEmail).not.toHaveBeenCalled();
	});
});
