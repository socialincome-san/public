const mockFindMany = jest.fn();
const mockCount = jest.fn();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		sentEmail: {
			findMany: mockFindMany,
			count: mockCount,
		},
	},
}));

import { findPaginatedSentEmails } from './mail.repository';

describe('mail repository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFindMany.mockResolvedValue([]);
		mockCount.mockResolvedValue(0);
	});

	test('applies pagination and the stable default sort', async () => {
		await findPaginatedSentEmails({
			page: 3,
			pageSize: 50,
			search: '',
		});

		expect(mockFindMany).toHaveBeenCalledWith({
			where: undefined,
			select: {
				id: true,
				sentAt: true,
				toEmail: true,
				fromEmail: true,
				subject: true,
				body: true,
				contact: {
					select: {
						firstName: true,
						lastName: true,
						email: true,
					},
				},
			},
			orderBy: [{ sentAt: 'desc' }, { id: 'desc' }],
			skip: 100,
			take: 50,
		});
		expect(mockCount).toHaveBeenCalledWith({ where: undefined });
	});

	test('searches all displayed content and applies the selected sort', async () => {
		await findPaginatedSentEmails({
			page: 1,
			pageSize: 10,
			search: '  Ada  ',
			sortBy: 'contact',
			sortDirection: 'asc',
		});

		const where = {
			OR: [
				{ id: { contains: 'Ada', mode: 'insensitive' } },
				{ toEmail: { contains: 'Ada', mode: 'insensitive' } },
				{ fromEmail: { contains: 'Ada', mode: 'insensitive' } },
				{ subject: { contains: 'Ada', mode: 'insensitive' } },
				{ body: { contains: 'Ada', mode: 'insensitive' } },
				{ contact: { firstName: { contains: 'Ada', mode: 'insensitive' } } },
				{ contact: { lastName: { contains: 'Ada', mode: 'insensitive' } } },
				{ contact: { email: { contains: 'Ada', mode: 'insensitive' } } },
			],
		};

		expect(mockFindMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where,
				orderBy: [{ contact: { firstName: 'asc' } }, { contact: { lastName: 'asc' } }, { id: 'asc' }],
			}),
		);
		expect(mockCount).toHaveBeenCalledWith({ where });
	});
});
