const mockGroupBy = jest.fn();
const mockFindMany = jest.fn();
const mockCreateMany = jest.fn();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		reserve: {
			groupBy: mockGroupBy,
			findMany: mockFindMany,
			createMany: mockCreateMany,
		},
	},
}));

import { createReserves, findReservesByAccountAndDate, groupLatestReserveDates } from './reserve.repository';

describe('reserve repository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('groups the latest reserve date by bank account', async () => {
		mockGroupBy.mockResolvedValue([]);

		await groupLatestReserveDates();

		expect(mockGroupBy).toHaveBeenCalledWith({
			by: ['bankAccountId'],
			_max: { date: true },
		});
	});

	test('selects only the reserve fields required by the service', async () => {
		mockFindMany.mockResolvedValue([]);
		const date = new Date('2026-08-12T00:00:00.000Z');

		await findReservesByAccountAndDate([{ bankAccountId: 'account-1', date }]);

		expect(mockFindMany).toHaveBeenCalledWith({
			where: { OR: [{ bankAccountId: 'account-1', date }] },
			select: {
				bankAccountId: true,
				amountChf: true,
				createdAt: true,
			},
		});
	});

	test('creates conflict-safe reserve snapshots', async () => {
		mockCreateMany.mockResolvedValue({ count: 1 });
		const reserves = [
			{
				bankAccountId: 'account-1',
				date: new Date('2026-08-12T00:00:00.000Z'),
				amount: 125,
				currency: 'CHF' as const,
				amountChf: 125,
			},
		];

		await createReserves(reserves);

		expect(mockCreateMany).toHaveBeenCalledWith({
			data: reserves,
			skipDuplicates: true,
		});
	});
});
