const mockSendSendgridEmail = jest.fn();
const mockIsAdmin = jest.fn();
const mockFindContactIdByEmail = jest.fn();
const mockFindPaginatedSentEmails = jest.fn();
const mockCreateSentEmail = jest.fn();

jest.mock('@/integrations/sendgrid/sendgrid-mail.integration', () => ({
	sendSendgridEmail: mockSendSendgridEmail,
}));

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
}));

jest.mock('./mail.repository', () => ({
	findContactIdByEmail: mockFindContactIdByEmail,
	findPaginatedSentEmails: mockFindPaginatedSentEmails,
	createSentEmail: mockCreateSentEmail,
}));

import { getPaginatedSentEmailTableView, sendMail } from './mail.service';
import type { SentEmailTableQuery } from './mail.types';

const tableQuery: SentEmailTableQuery = {
	page: 1,
	pageSize: 10,
	search: '',
	sortBy: 'sentAt',
	sortDirection: 'desc',
};

describe('mail service', () => {
	const originalApiKey = process.env.SENDGRID_API_KEY;
	const originalFromEmail = process.env.SENDGRID_FROM_EMAIL;

	beforeEach(() => {
		jest.clearAllMocks();
		process.env.SENDGRID_API_KEY = 'test-api-key';
		process.env.SENDGRID_FROM_EMAIL = 'sender@example.com';
		mockSendSendgridEmail.mockResolvedValue({ success: true, data: undefined });
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
		mockFindContactIdByEmail.mockResolvedValue(null);
		mockFindPaginatedSentEmails.mockResolvedValue({ sentEmails: [], totalCount: 0 });
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
						contact: 'Ada Lovelace recipient@example.com',
					},
				],
				totalCount: 1,
			},
		});
		expect(mockIsAdmin).toHaveBeenCalledWith('admin-1');
		expect(mockFindPaginatedSentEmails).toHaveBeenCalledWith(tableQuery);
	});

	test('passes pagination, search, and sorting to the repository', async () => {
		const query: SentEmailTableQuery = {
			page: 3,
			pageSize: 50,
			search: '  recipient@example.com  ',
			sortBy: 'toEmail',
			sortDirection: 'asc',
		};

		await getPaginatedSentEmailTableView('admin-1', query);

		expect(mockFindPaginatedSentEmails).toHaveBeenCalledWith(query);
	});

	test('requires admin access for the sent email table', async () => {
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
