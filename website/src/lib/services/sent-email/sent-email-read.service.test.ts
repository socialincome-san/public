import type { PrismaClient } from '@/generated/prisma/client';
import type { UserReadService } from '../user/user-read.service';
import { SentEmailReadService } from './sent-email-read.service';
import type { SentEmailTableQuery } from './sent-email.types';

const query: SentEmailTableQuery = {
	page: 1,
	pageSize: 10,
	search: '',
	sortBy: 'sentAt',
	sortDirection: 'desc',
};

describe('SentEmailReadService', () => {
	test('returns paginated sent emails and formats the contact', async () => {
		const findMany = jest.fn().mockResolvedValue([
			{
				id: 'email-1',
				sentAt: new Date('2026-09-01T10:00:00.000Z'),
				toEmail: 'recipient@example.com',
				fromEmail: 'sender@example.com',
				subject: 'Monthly summary',
				body: 'Summary body',
				contact: { firstName: 'Ada', lastName: 'Lovelace', email: 'recipient@example.com' },
			},
		]);
		const count = jest.fn().mockResolvedValue(1);
		const isAdmin = jest.fn().mockResolvedValue({ success: true, data: true });
		const service = new SentEmailReadService(
			{ sentEmail: { findMany, count } } as never as PrismaClient,
			{ isAdmin } as never as UserReadService,
		);

		const result = await service.getPaginatedTableView('admin-1', query);

		expect(result).toEqual({
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
		expect(isAdmin).toHaveBeenCalledWith('admin-1');
		expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 10 }));
		expect(count).toHaveBeenCalledWith({ where: undefined });
	});

	test('returns a failed result when the database query fails', async () => {
		const service = new SentEmailReadService(
			{ sentEmail: { findMany: jest.fn().mockRejectedValue(new Error('Database unavailable')), count: jest.fn() } } as never,
			{ isAdmin: jest.fn().mockResolvedValue({ success: true, data: true }) } as never,
		);

		const result = await service.getPaginatedTableView('admin-1', query);

		expect(result).toEqual({ success: false, error: 'Could not fetch sent emails: {}' });
	});
});
