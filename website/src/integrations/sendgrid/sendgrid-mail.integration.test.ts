import sgMail from '@sendgrid/mail';
import { sendSendgridEmail } from './sendgrid-mail.integration';

jest.mock('@sendgrid/mail', () => ({
	__esModule: true,
	default: {
		setApiKey: jest.fn(),
		send: jest.fn(),
	},
}));

// SendGrid's methods are replaced by Jest mocks above.
// eslint-disable-next-line @typescript-eslint/unbound-method
const mockSetApiKey = sgMail.setApiKey as unknown as jest.Mock;
// eslint-disable-next-line @typescript-eslint/unbound-method
const mockSend = sgMail.send as unknown as jest.Mock;

describe('sendSendgridEmail', () => {
	const originalApiKey = process.env.SENDGRID_API_KEY;

	afterEach(() => {
		process.env.SENDGRID_API_KEY = originalApiKey;
		jest.clearAllMocks();
	});

	test('returns a stable error when SendGrid is not configured', async () => {
		delete process.env.SENDGRID_API_KEY;

		await expect(
			sendSendgridEmail({
				to: 'recipient@example.com',
				from: 'sender@example.com',
				subject: 'Subject',
				text: 'Body',
			}),
		).resolves.toEqual({ success: false, error: 'SendGrid is not configured' });
		expect(mockSend).not.toHaveBeenCalled();
	});

	test('sends an email through SendGrid', async () => {
		process.env.SENDGRID_API_KEY = 'test-api-key';
		mockSend.mockResolvedValue([] as never);

		await expect(
			sendSendgridEmail({
				to: ['one@example.com', 'two@example.com'],
				from: 'sender@example.com',
				subject: 'Subject',
				text: 'Body',
			}),
		).resolves.toEqual({ success: true, data: undefined });
		expect(mockSetApiKey).toHaveBeenCalledWith('test-api-key');
		expect(mockSend).toHaveBeenCalledWith({
			to: ['one@example.com', 'two@example.com'],
			from: 'sender@example.com',
			subject: 'Subject',
			text: 'Body',
		});
	});

	test('returns a stable error when SendGrid fails', async () => {
		process.env.SENDGRID_API_KEY = 'test-api-key';
		mockSend.mockRejectedValue(new Error('SendGrid unavailable'));

		await expect(
			sendSendgridEmail({
				to: 'recipient@example.com',
				from: 'sender@example.com',
				subject: 'Subject',
				text: 'Body',
			}),
		).resolves.toEqual({ success: false, error: 'Could not send email' });
	});
});
