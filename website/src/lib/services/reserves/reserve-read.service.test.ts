import { type PrismaClient } from '@/generated/prisma/client';
import { ReserveReadService } from './reserve-read.service';

describe('ReserveReadService.getLatestPerBankAccount', () => {
	test('sums all currencies from the latest reserve date per bank account', async () => {
		const latestDate = new Date('2026-08-12T00:00:00.000Z');
		const earlierRecordedAt = new Date('2026-08-12T11:00:00.000Z');
		const latestRecordedAt = new Date('2026-08-12T12:00:00.000Z');
		const findMany = jest.fn().mockResolvedValue([
			{
				id: 'account-with-reserves',
				bankAccountNumber: 'CH1909000000151126386',
				description: 'Main account',
			},
			{
				id: 'account-with-reserve',
				bankAccountNumber: 'CH9709000000169153887',
				description: 'Secondary account',
			},
			{
				id: 'account-without-reserve',
				bankAccountNumber: 'CH5709000000154860881',
				description: null,
			},
		]);
		const groupBy = jest.fn().mockResolvedValue([
			{ bankAccountId: 'account-with-reserves', _max: { date: latestDate } },
			{ bankAccountId: 'account-with-reserve', _max: { date: latestDate } },
		]);
		const findManyReserves = jest.fn().mockResolvedValue([
			{
				bankAccountId: 'account-with-reserves',
				amountChf: '100.00',
				createdAt: earlierRecordedAt,
			},
			{
				bankAccountId: 'account-with-reserves',
				amountChf: '25.50',
				createdAt: latestRecordedAt,
			},
			{
				bankAccountId: 'account-with-reserve',
				amountChf: '24.50',
				createdAt: latestRecordedAt,
			},
		]);
		const db = { bankAccount: { findMany }, reserve: { groupBy, findMany: findManyReserves } };
		const service = new ReserveReadService(db as unknown as PrismaClient);

		await expect(service.getLatestPerBankAccount()).resolves.toEqual({
			success: true,
			data: {
				accounts: [
					{
						bankAccountId: 'account-with-reserves',
						bankAccountNumber: 'CH1909000000151126386',
						description: 'Main account',
						amountChf: 125.5,
						recordedAt: latestRecordedAt,
					},
					{
						bankAccountId: 'account-with-reserve',
						bankAccountNumber: 'CH9709000000169153887',
						description: 'Secondary account',
						amountChf: 24.5,
						recordedAt: latestRecordedAt,
					},
					{
						bankAccountId: 'account-without-reserve',
						bankAccountNumber: 'CH5709000000154860881',
						description: null,
						amountChf: null,
						recordedAt: null,
					},
				],
				total: 150,
			},
		});
		expect(groupBy).toHaveBeenCalledWith({
			by: ['bankAccountId'],
			_max: { date: true },
		});
		expect(findMany).toHaveBeenCalledWith({
			select: {
				id: true,
				bankAccountNumber: true,
				description: true,
			},
		});
		expect(findManyReserves).toHaveBeenCalledWith({
			where: {
				OR: [
					{ bankAccountId: 'account-with-reserves', date: latestDate },
					{ bankAccountId: 'account-with-reserve', date: latestDate },
				],
			},
			select: {
				bankAccountId: true,
				amountChf: true,
				createdAt: true,
			},
		});
	});

	test('returns an empty account list and zero total when no bank accounts exist', async () => {
		const findManyReserves = jest.fn();
		const db = {
			bankAccount: { findMany: jest.fn().mockResolvedValue([]) },
			reserve: {
				groupBy: jest.fn().mockResolvedValue([]),
				findMany: findManyReserves,
			},
		};
		const service = new ReserveReadService(db as unknown as PrismaClient);

		await expect(service.getLatestPerBankAccount()).resolves.toEqual({
			success: true,
			data: {
				accounts: [],
				total: 0,
			},
		});
		expect(findManyReserves).not.toHaveBeenCalled();
	});
});
