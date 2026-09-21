import sgMail from '@sendgrid/mail';
import { SendgridMailService } from './sendgrid-mail.service';

jest.mock('@sendgrid/mail', () => ({
	__esModule: true,
	default: {
		setApiKey: jest.fn(),
		send: jest.fn(),
	},
}));

// SendGrid's methods are replaced by Jest mocks above.
// eslint-disable-next-line @typescript-eslint/unbound-method
const mockSetApiKey = sgMail.setApiKey as jest.Mock;
// eslint-disable-next-line @typescript-eslint/unbound-method
const mockSend = sgMail.send as jest.Mock;

describe('SendgridMailService', () => {
	const db = {
		contact: { findUnique: jest.fn().mockResolvedValue(null) },
		sentEmail: { create: jest.fn().mockResolvedValue({}) },
	};
	const originalApiKey = process.env.SENDGRID_API_KEY;
	const originalFromEmail = process.env.SENDGRID_FROM_EMAIL;

	afterEach(() => {
		process.env.SENDGRID_API_KEY = originalApiKey;
		process.env.SENDGRID_FROM_EMAIL = originalFromEmail;
		jest.clearAllMocks();
	});

	test('returns an error when SendGrid configuration is missing', async () => {
		delete process.env.SENDGRID_API_KEY;
		delete process.env.SENDGRID_FROM_EMAIL;

		const result = await new SendgridMailService(db as never).send({
			to: 'recipient@example.com',
			subject: 'Subject',
			text: 'Body',
		});

		expect(result).toEqual({
			success: false,
			error: 'Missing required SendGrid environment variables',
		});
		expect(mockSend).not.toHaveBeenCalled();
	});

	test('sends an email to one or more recipients', async () => {
		process.env.SENDGRID_API_KEY = 'test-api-key';
		process.env.SENDGRID_FROM_EMAIL = 'sender@example.com';
		mockSend.mockResolvedValue([] as never);

		const result = await new SendgridMailService(db as never).send({
			to: ['one@example.com', 'two@example.com'],
			subject: 'Subject',
			text: 'Body',
		});

		expect(result).toEqual({ success: true, data: undefined });
		expect(mockSetApiKey).toHaveBeenCalledWith('test-api-key');
		expect(mockSend).toHaveBeenCalledWith({
			to: ['one@example.com', 'two@example.com'],
			from: 'sender@example.com',
			subject: 'Subject',
			text: 'Body',
		});
		expect(db.sentEmail.create).toHaveBeenCalledTimes(2);
	});

	test('returns an error when SendGrid fails', async () => {
		process.env.SENDGRID_API_KEY = 'test-api-key';
		process.env.SENDGRID_FROM_EMAIL = 'sender@example.com';
		mockSend.mockRejectedValue(new Error('SendGrid unavailable'));

		const result = await new SendgridMailService(db as never).send({
			to: 'recipient@example.com',
			subject: 'Subject',
			text: 'Body',
		});

		expect(result).toEqual({
			success: false,
			error: 'Unable to send email: Error: SendGrid unavailable',
		});
		expect(db.sentEmail.create).not.toHaveBeenCalled();
	});

	test('returns an error when storing the sent email fails', async () => {
		process.env.SENDGRID_API_KEY = 'test-api-key';
		process.env.SENDGRID_FROM_EMAIL = 'sender@example.com';
		mockSend.mockResolvedValue([] as never);
		jest.mocked(db.sentEmail.create).mockRejectedValue(new Error('Database unavailable'));

		const result = await new SendgridMailService(db as never).send({
			to: 'recipient@example.com',
			subject: 'Subject',
			text: 'Body',
		});

		expect(result).toEqual({
			success: false,
			error: 'Unable to send email: Error: Database unavailable',
		});
	});
});
