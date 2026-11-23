const mockRequest = jest.fn();

jest.mock('@sendgrid/client', () => ({
	Client: jest.fn().mockImplementation(() => ({ setApiKey: jest.fn(), request: mockRequest })),
}));

import { listSendgridAutomations } from './sendgrid-automations.integration';

const automation = (name: string, status: string) => ({
	name,
	status,
	steps: [
		{ send_timing: 'PT0S', messages: [{ subject: 'First ' }] },
		{ send_timing: 'P4D', messages: [{ subject: 'Second' }] },
	],
});

describe('listSendgridAutomations', () => {
	const originalApiKey = process.env.SENDGRID_API_KEY;

	beforeEach(() => {
		jest.clearAllMocks();
		process.env.SENDGRID_API_KEY = 'test-api-key';
		mockRequest.mockImplementation(({ url }: { url: string }) => {
			if (url === '/v3/marketing/automations') {
				return Promise.resolve([
					{
						body: [
							{ id: 'fr', name: 'Welcome Series (FR)' },
							{ id: 'en', name: 'Welcome Series (EN)' },
							{ id: 'other', name: 'Other' },
						],
					},
				]);
			}

			return Promise.resolve([
				{
					body: url.endsWith('/en') ? automation('Welcome Series (EN)', 'live') : automation('Welcome Series (FR)', 'draft'),
				},
			]);
		});
	});

	afterEach(() => {
		process.env.SENDGRID_API_KEY = originalApiKey;
	});

	test('returns the named automations in the requested order with their steps', async () => {
		await expect(listSendgridAutomations(['Welcome Series (EN)', 'Welcome Series (FR)'])).resolves.toEqual({
			success: true,
			data: [
				{
					name: 'Welcome Series (EN)',
					status: 'live',
					steps: [
						{ sendTiming: 'PT0S', subject: 'First' },
						{ sendTiming: 'P4D', subject: 'Second' },
					],
				},
				expect.objectContaining({ name: 'Welcome Series (FR)', status: 'draft' }),
			],
		});
		expect(mockRequest).toHaveBeenCalledTimes(3);
	});

	test('returns a stable error when SendGrid answers unexpectedly', async () => {
		mockRequest.mockResolvedValue([{ body: { errors: [] } }]);
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(listSendgridAutomations(['Welcome Series (EN)'])).resolves.toEqual({
			success: false,
			error: 'Could not load SendGrid automations',
		});
		consoleError.mockRestore();
	});
});
