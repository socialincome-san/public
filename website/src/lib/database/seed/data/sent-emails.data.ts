import { SentEmail } from '@/generated/prisma/client';

export const sentEmailsData: SentEmail[] = [
	{
		id: 'sent-email-1',
		toEmail: 'smh1@portal.test',
		fromEmail: 'ops-reports@socialincome.org',
		contactId: 'ct-user-somaha-1',
		subject: 'Monthly summary - August 2026',
		body: 'Summary body for August 2026',
		sentAt: new Date('2026-09-01T08:00:00.000Z'),
		createdAt: new Date('2026-09-01T08:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'sent-email-2',
		toEmail: 'external@example.com',
		fromEmail: 'ops-reports@socialincome.org',
		contactId: null,
		subject: 'Welcome email',
		body: 'Welcome to Social Income',
		sentAt: new Date('2026-08-15T10:30:00.000Z'),
		createdAt: new Date('2026-08-15T10:30:00.000Z'),
		updatedAt: null,
	},
];
