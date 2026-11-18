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

const tracking = { categories: ['internal', 'monthly-summary'], customArgs: { sent_email_id: 'email-1' } };

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
				...tracking,
			}),
		).resolves.toEqual({ success: false, error: 'SendGrid is not configured' });
		expect(mockSend).not.toHaveBeenCalled();
	});

	test('sends an email through SendGrid and returns its message id', async () => {
		process.env.SENDGRID_API_KEY = 'test-api-key';
		mockSend.mockResolvedValue([{ headers: { 'x-message-id': 'msg-1' } }]);

		await expect(
			sendSendgridEmail({
				to: 'one@example.com',
				from: 'sender@example.com',
				subject: 'Subject',
				text: 'Body',
				...tracking,
			}),
		).resolves.toEqual({ success: true, data: { messageId: 'msg-1' } });
		expect(mockSetApiKey).toHaveBeenCalledWith('test-api-key');
		expect(mockSend).toHaveBeenCalledWith({
			to: 'one@example.com',
			from: 'sender@example.com',
			subject: 'Subject',
			text: 'Body',
			...tracking,
		});
	});

	test('sends a dynamic template instead of the text when a template is given', async () => {
		process.env.SENDGRID_API_KEY = 'test-api-key';
		mockSend.mockResolvedValue([{ headers: {} }]);

		await expect(
			sendSendgridEmail({
				to: 'recipient@example.com',
				from: 'sender@example.com',
				subject: 'Subject',
				text: 'Body',
				template: { id: 'd-template-id', data: { month: 'August 2026' } },
				...tracking,
			}),
		).resolves.toEqual({ success: true, data: { messageId: null } });
		expect(mockSend).toHaveBeenCalledWith({
			to: 'recipient@example.com',
			from: 'sender@example.com',
			templateId: 'd-template-id',
			dynamicTemplateData: { month: 'August 2026' },
			...tracking,
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
				...tracking,
			}),
		).resolves.toEqual({ success: false, error: 'Could not send email' });
	});
});
