import { resultFail, resultOk } from '@/lib/service-result';
import { Client } from '@sendgrid/client';
import { searchSendgridNewsletterContact, upsertSendgridNewsletterSubscription } from './sendgrid-subscription.integration';

const mockSetApiKey = jest.fn();
const mockRequest = jest.fn();

jest.mock('@sendgrid/client', () => ({
	Client: jest.fn().mockImplementation(() => ({
		setApiKey: mockSetApiKey,
		request: mockRequest,
	})),
}));

describe('sendgrid subscription integration', () => {
	const originalApiKey = process.env.SENDGRID_API_KEY;
	const originalListId = process.env.SENDGRID_LIST_ID;
	const originalSuppressionListId = process.env.SENDGRID_SUPPRESSION_LIST_ID;

	beforeEach(() => {
		jest.clearAllMocks();
		process.env.SENDGRID_API_KEY = 'test-api-key';
		process.env.SENDGRID_LIST_ID = 'list-1';
		process.env.SENDGRID_SUPPRESSION_LIST_ID = '42';
	});

	afterEach(() => {
		process.env.SENDGRID_API_KEY = originalApiKey;
		process.env.SENDGRID_LIST_ID = originalListId;
		process.env.SENDGRID_SUPPRESSION_LIST_ID = originalSuppressionListId;
	});

	test('returns a configured-error when environment variables are missing', async () => {
		delete process.env.SENDGRID_API_KEY;

		await expect(searchSendgridNewsletterContact('ada@example.com')).resolves.toEqual(
			resultFail('Missing required Sendgrid environment variables'),
		);
		expect(Client).not.toHaveBeenCalled();
	});

	test('returns a subscribed contact when SendGrid finds the email', async () => {
		mockRequest
			.mockResolvedValueOnce([{}, { result: { 'ada@example.com': { contact: { email: 'ada@example.com' } } } }])
			.mockResolvedValueOnce([{}, { suppressions: [{ id: 42, suppressed: false }] }]);

		await expect(searchSendgridNewsletterContact('ada@example.com')).resolves.toEqual(
			resultOk({ email: 'ada@example.com', status: 'subscribed' }),
		);
		expect(mockSetApiKey).toHaveBeenCalledWith('test-api-key');
	});

	test('adds a new contact and removes suppression when subscribing', async () => {
		mockRequest.mockRejectedValueOnce({ code: 404 }).mockResolvedValueOnce([{}, {}]).mockResolvedValueOnce([{}, {}]);

		await expect(
			upsertSendgridNewsletterSubscription({
				email: 'ada@example.com',
				language: 'en',
				firstname: 'Ada',
				status: 'subscribed',
			}),
		).resolves.toEqual(resultOk(undefined));
		expect(mockRequest).toHaveBeenCalledTimes(3);
	});
});
