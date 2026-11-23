const mockSendSendgridEmail = jest.fn();
const mockVerifySendgridEventWebhook = jest.fn();
const mockIsAdmin = jest.fn();
const mockFindContactIdByEmail = jest.fn();
const mockFindPaginatedSentEmails = jest.fn();
const mockFindSentEmailByIdempotencyKey = jest.fn();
const mockCreateSentEmail = jest.fn();
const mockUpdateSentEmail = jest.fn();
const mockUpdateSentEmailStatusIfIn = jest.fn();
const mockGroupSentEmailCountsByType = jest.fn();
const mockRenderNotification = jest.fn();
const mockListSendgridAutomations = jest.fn();

jest.mock('@/integrations/sendgrid/sendgrid-mail.integration', () => ({
	sendSendgridEmail: mockSendSendgridEmail,
}));

jest.mock('@/integrations/sendgrid/sendgrid-events.integration', () => ({
	verifySendgridEventWebhook: mockVerifySendgridEventWebhook,
}));

jest.mock('@/integrations/sendgrid/sendgrid-automations.integration', () => ({
	listSendgridAutomations: mockListSendgridAutomations,
}));

jest.mock('./mail-templates.service', () => ({
	renderNotification: mockRenderNotification,
}));

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
}));

jest.mock('./mail.repository', () => ({
	findContactIdByEmail: mockFindContactIdByEmail,
	findPaginatedSentEmails: mockFindPaginatedSentEmails,
	findSentEmailByIdempotencyKey: mockFindSentEmailByIdempotencyKey,
	createSentEmail: mockCreateSentEmail,
	updateSentEmail: mockUpdateSentEmail,
	updateSentEmailStatusIfIn: mockUpdateSentEmailStatusIfIn,
	groupSentEmailCountsByType: mockGroupSentEmailCountsByType,
}));

import {
	getEmailCatalog,
	getEmailCatalogDetail,
	getPaginatedSentEmailTableView,
	handleSendgridEvents,
	sendNotification,
} from './mail.service';
import type { SendNotificationInput, SentEmailTableQuery } from './mail.types';

const tableQuery: SentEmailTableQuery = {
	page: 1,
	pageSize: 10,
	search: '',
	sortBy: 'sentAt',
	sortDirection: 'desc',
};

describe('mail service', () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		jest.clearAllMocks();
		process.env.SENDGRID_API_KEY = 'test-api-key';
		process.env.SENDGRID_FROM_EMAIL = 'sender@example.com';
		process.env.MONTHLY_SUMMARY_RECIPIENTS = 'one@example.com, two@example.com';
		mockSendSendgridEmail.mockResolvedValue({ success: true, data: { messageId: 'msg-1' } });
		mockVerifySendgridEventWebhook.mockReturnValue({ success: true, data: true });
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
		mockFindContactIdByEmail.mockResolvedValue(null);
		mockFindPaginatedSentEmails.mockResolvedValue({ sentEmails: [], totalCount: 0 });
		mockFindSentEmailByIdempotencyKey.mockResolvedValue(null);
		mockCreateSentEmail.mockResolvedValue({ kind: 'created', id: 'email-1' });
		mockUpdateSentEmail.mockResolvedValue({ id: 'email-1' });
		mockUpdateSentEmailStatusIfIn.mockResolvedValue({ count: 1 });
		mockGroupSentEmailCountsByType.mockResolvedValue({ totals: [], problems: [] });
		mockRenderNotification.mockReturnValue({ success: true, data: { subject: 'Subject', text: 'Body' } });
	});

	afterEach(() => {
		process.env = { ...originalEnv };
	});

	describe('sendNotification', () => {
		const input: SendNotificationInput = {
			type: 'campaign-edited',
			data: {
				id: 'campaign-1',
				slug: 'campaign',
				title: 'Campaign',
				storyId: 1,
				editorName: 'Ada',
				changedFields: ['title'],
				hadUnpublishedChanges: false,
			},
		};

		beforeEach(() => {
			process.env.CAMPAIGN_EDIT_NOTIFICATION_RECIPIENTS = 'one@example.com, two@example.com';
		});

		test('returns an error when SendGrid configuration is missing', async () => {
			delete process.env.SENDGRID_FROM_EMAIL;

			await expect(sendNotification(input)).resolves.toEqual({
				success: false,
				error: 'Missing required SendGrid environment variables',
			});
			expect(mockSendSendgridEmail).not.toHaveBeenCalled();
		});

		test('returns an error when the staff receivers are not set', async () => {
			delete process.env.CAMPAIGN_EDIT_NOTIFICATION_RECIPIENTS;

			await expect(sendNotification(input)).resolves.toEqual({
				success: false,
				error: 'Notification recipients not set',
			});
			expect(mockSendSendgridEmail).not.toHaveBeenCalled();
		});

		test('logs and sends one email per receiver, tagged with type and log id', async () => {
			mockFindContactIdByEmail.mockImplementation((email: string) =>
				Promise.resolve(email === 'one@example.com' ? { id: 'contact-1' } : null),
			);

			await expect(
				sendNotification({ ...input, idempotencyKey: 'campaign-edited:1', campaignId: 'campaign-1' }),
			).resolves.toEqual({ success: true, data: { sent: 2, skipped: 0 } });

			expect(mockCreateSentEmail).toHaveBeenCalledWith({
				toEmail: 'one@example.com',
				fromEmail: 'sender@example.com',
				subject: 'Subject',
				body: 'Body',
				contactId: 'contact-1',
				type: 'campaign-edited',
				status: 'queued',
				idempotencyKey: 'campaign-edited:1:one@example.com',
				campaignId: 'campaign-1',
			});
			expect(mockSendSendgridEmail).toHaveBeenCalledWith({
				to: 'two@example.com',
				from: 'sender@example.com',
				subject: 'Subject',
				text: 'Body',
				template: undefined,
				categories: ['internal', 'campaign-edited'],
				customArgs: { sent_email_id: 'email-1' },
			});
			expect(mockUpdateSentEmail).toHaveBeenCalledWith('email-1', expect.objectContaining({ providerMessageId: 'msg-1' }));
			expect(mockUpdateSentEmailStatusIfIn).toHaveBeenCalledWith(
				'email-1',
				['queued', 'failed'],
				expect.objectContaining({ status: 'sent', errorMessage: null }),
			);
		});

		test('skips receivers that already got the email', async () => {
			mockFindSentEmailByIdempotencyKey.mockResolvedValue({
				id: 'email-1',
				status: 'delivered',
				createdAt: new Date(),
				updatedAt: null,
			});

			await expect(sendNotification({ ...input, idempotencyKey: 'campaign-edited:1' })).resolves.toEqual({
				success: true,
				data: { sent: 0, skipped: 2 },
			});
			expect(mockSendSendgridEmail).not.toHaveBeenCalled();
		});

		test('skips when a parallel run logged the email first', async () => {
			mockCreateSentEmail.mockResolvedValue({ kind: 'duplicate' });

			await expect(sendNotification({ ...input, idempotencyKey: 'campaign-edited:1' })).resolves.toEqual({
				success: true,
				data: { sent: 0, skipped: 2 },
			});
			expect(mockSendSendgridEmail).not.toHaveBeenCalled();
		});

		test('skips an email that another run is sending right now', async () => {
			mockFindSentEmailByIdempotencyKey.mockResolvedValue({
				id: 'email-7',
				status: 'queued',
				createdAt: new Date(Date.now() - 60 * 1000),
				updatedAt: null,
			});

			await expect(sendNotification({ ...input, idempotencyKey: 'campaign-edited:1' })).resolves.toEqual({
				success: true,
				data: { sent: 0, skipped: 2 },
			});
			expect(mockSendSendgridEmail).not.toHaveBeenCalled();
		});

		test('retries an email that got stuck in the queue', async () => {
			mockFindSentEmailByIdempotencyKey.mockResolvedValue({
				id: 'email-7',
				status: 'queued',
				createdAt: new Date(Date.now() - 60 * 60 * 1000),
				updatedAt: null,
			});

			await expect(sendNotification({ ...input, idempotencyKey: 'campaign-edited:1' })).resolves.toEqual({
				success: true,
				data: { sent: 2, skipped: 0 },
			});
		});

		test('retries a failed email on the same log row', async () => {
			mockFindSentEmailByIdempotencyKey.mockResolvedValue({
				id: 'email-7',
				status: 'failed',
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			await expect(sendNotification({ ...input, idempotencyKey: 'campaign-edited:1' })).resolves.toEqual({
				success: true,
				data: { sent: 2, skipped: 0 },
			});
			expect(mockCreateSentEmail).not.toHaveBeenCalled();
			expect(mockUpdateSentEmailStatusIfIn).toHaveBeenCalledWith(
				'email-7',
				['queued', 'failed'],
				expect.objectContaining({ status: 'sent' }),
			);
		});

		test('returns the render error without sending', async () => {
			mockRenderNotification.mockReturnValue({ success: false, error: 'Missing monthly summary SendGrid template' });

			await expect(sendNotification(input)).resolves.toEqual({
				success: false,
				error: 'Missing monthly summary SendGrid template',
			});
			expect(mockCreateSentEmail).not.toHaveBeenCalled();
		});

		test('marks the log row as failed when SendGrid fails', async () => {
			mockSendSendgridEmail.mockResolvedValue({ success: false, error: 'Could not send email' });

			await expect(sendNotification(input)).resolves.toEqual({
				success: false,
				error: 'Could not send notification',
			});
			expect(mockUpdateSentEmail).toHaveBeenCalledWith(
				'email-1',
				expect.objectContaining({ status: 'failed', errorMessage: 'Could not send email' }),
			);
		});
	});

	describe('handleSendgridEvents', () => {
		const webhook = (events: unknown) => ({
			signature: 'signature',
			timestamp: '1700000000',
			rawBody: JSON.stringify(events),
		});

		test('rejects requests with an invalid signature', async () => {
			mockVerifySendgridEventWebhook.mockReturnValue({ success: true, data: false });

			await expect(handleSendgridEvents(webhook([]))).resolves.toEqual({
				success: false,
				error: 'Invalid SendGrid signature',
				status: 403,
			});
			expect(mockUpdateSentEmailStatusIfIn).not.toHaveBeenCalled();
		});

		test('rejects a payload that is not a list of events', async () => {
			await expect(handleSendgridEvents(webhook({ event: 'delivered' }))).resolves.toEqual({
				success: false,
				error: 'Invalid SendGrid event payload',
				status: 400,
			});
		});

		test('only moves a status forward', async () => {
			await expect(
				handleSendgridEvents(
					webhook([{ event: 'delivered', timestamp: 1700000000, sent_email_id: 'email-1', response: '250 OK' }]),
				),
			).resolves.toEqual({ success: true, data: { updated: 1 } });

			expect(mockUpdateSentEmailStatusIfIn).toHaveBeenCalledWith('email-1', ['queued', 'sent', 'failed', 'deferred'], {
				status: 'delivered',
				errorMessage: '250 OK',
				statusUpdatedAt: new Date(1700000000 * 1000),
			});
		});

		test('ignores events without a log id and events that change no status', async () => {
			await expect(
				handleSendgridEvents(
					webhook([
						{ event: 'delivered', timestamp: 1700000000 },
						{ event: 'processed', timestamp: 1700000000, sent_email_id: 'email-1' },
						{ event: 'click', timestamp: 1700000000, sent_email_id: 'email-1' },
						{ event: 'constructor', timestamp: 1700000000, sent_email_id: 'email-1' },
					]),
				),
			).resolves.toEqual({ success: true, data: { updated: 0 } });
			expect(mockUpdateSentEmailStatusIfIn).not.toHaveBeenCalled();
		});
	});

	describe('email catalog', () => {
		test('lists live emails with their log counts, then planned and external ones', async () => {
			mockGroupSentEmailCountsByType.mockResolvedValue({
				totals: [{ type: 'campaign-edited', _count: { _all: 4 }, _max: { sentAt: new Date('2026-11-01T10:00:00.000Z') } }],
				problems: [{ type: 'campaign-edited', _count: { _all: 1 } }],
			});

			const result = await getEmailCatalog('admin-1');

			expect(result.success).toBe(true);
			const entries = result.success ? result.data : [];
			expect(entries.find((entry) => entry.key === 'campaign-edited')).toMatchObject({
				status: 'live',
				sentCount: 4,
				problemCount30Days: 1,
				lastSentAt: new Date('2026-11-01T10:00:00.000Z'),
			});
			expect(entries.find((entry) => entry.key === 'welcome-series')).toMatchObject({ status: 'external' });
			expect(entries.find((entry) => entry.key === 'donation-thank-you')).toMatchObject({ status: 'planned' });
		});

		test('requires admin access', async () => {
			mockIsAdmin.mockResolvedValue({ success: false, error: 'Permission denied' });

			await expect(getEmailCatalog('user-1')).resolves.toEqual({ success: false, error: 'Permission denied' });
			await expect(getEmailCatalogDetail('user-1', 'campaign-edited')).resolves.toEqual({
				success: false,
				error: 'Permission denied',
			});
		});

		test('previews a live email with sample data and its receivers', async () => {
			process.env.CAMPAIGN_EDIT_NOTIFICATION_RECIPIENTS = 'staff@example.com';

			const result = await getEmailCatalogDetail('admin-1', 'campaign-edited');

			expect(mockRenderNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'campaign-edited' }));
			expect(result).toMatchObject({
				success: true,
				data: {
					receivers: ['staff@example.com'],
					preview: { from: 'sender@example.com', to: 'staff@example.com', subject: 'Subject', body: 'Body' },
					previewError: null,
				},
			});
		});

		test('shows the steps of SendGrid automations', async () => {
			mockListSendgridAutomations.mockResolvedValue({
				success: true,
				data: [
					{
						name: 'Welcome Series (EN)',
						status: 'live',
						steps: [
							{ sendTiming: 'PT0S', subject: 'You made it on the list.' },
							{ sendTiming: 'P4D', subject: 'Who should, if not us?' },
						],
					},
				],
			});

			const result = await getEmailCatalogDetail('admin-1', 'welcome-series');

			expect(mockListSendgridAutomations).toHaveBeenCalledWith([
				'Welcome Series (EN)',
				'Welcome Series (DE)',
				'Welcome Series (FR)',
			]);
			expect(result).toMatchObject({
				success: true,
				data: {
					preview: null,
					automations: [
						{
							name: 'Welcome Series (EN)',
							status: 'live',
							steps: [
								{ delay: 'Immediately', subject: 'You made it on the list.' },
								{ delay: '4 days after the previous email', subject: 'Who should, if not us?' },
							],
						},
					],
				},
			});
		});

		test('returns not found for an unknown email', async () => {
			await expect(getEmailCatalogDetail('admin-1', 'unknown')).resolves.toEqual({
				success: false,
				error: 'Email not found',
				status: 404,
			});
		});
	});

	describe('getPaginatedSentEmailTableView', () => {
		test('returns paginated sent emails and formats the contact', async () => {
			mockFindPaginatedSentEmails.mockResolvedValue({
				sentEmails: [
					{
						id: 'email-1',
						sentAt: new Date('2026-09-01T10:00:00.000Z'),
						toEmail: 'recipient@example.com',
						fromEmail: 'sender@example.com',
						subject: 'Monthly summary',
						body: 'Summary body',
						type: null,
						status: 'bounced',
						errorMessage: 'Mailbox does not exist',
						contact: { firstName: 'Ada', lastName: 'Lovelace', email: 'recipient@example.com' },
					},
				],
				totalCount: 1,
			});

			await expect(getPaginatedSentEmailTableView('admin-1', tableQuery)).resolves.toEqual({
				success: true,
				data: {
					tableRows: [
						{
							id: 'email-1',
							sentAt: new Date('2026-09-01T10:00:00.000Z'),
							toEmail: 'recipient@example.com',
							fromEmail: 'sender@example.com',
							subject: 'Monthly summary',
							body: 'Summary body',
							type: '',
							status: 'bounced',
							errorMessage: 'Mailbox does not exist',
							contact: 'Ada Lovelace recipient@example.com',
						},
					],
					totalCount: 1,
				},
			});
			expect(mockIsAdmin).toHaveBeenCalledWith('admin-1');
			expect(mockFindPaginatedSentEmails).toHaveBeenCalledWith(tableQuery, undefined);
		});

		test('requires admin access', async () => {
			mockIsAdmin.mockResolvedValue({ success: false, error: 'Permission denied' });

			await expect(getPaginatedSentEmailTableView('user-1', tableQuery)).resolves.toEqual({
				success: false,
				error: 'Permission denied',
			});
			expect(mockFindPaginatedSentEmails).not.toHaveBeenCalled();
		});

		test('returns a stable error when the sent email query fails', async () => {
			mockFindPaginatedSentEmails.mockRejectedValue(new Error('Database unavailable'));

			await expect(getPaginatedSentEmailTableView('admin-1', tableQuery)).resolves.toEqual({
				success: false,
				error: 'Could not fetch sent emails',
			});
		});
	});
});
