import { type PrismaClient } from '@/generated/prisma/client';
import { ReserveReadService } from './reserve-read.service';

describe('ReserveReadService.getLatestPerBankAccount', () => {
	test('returns the latest reserve per bank account and sums available amounts', async () => {
		const latestUpdatedAt = new Date('2026-08-12T12:00:00.000Z');
		const findMany = jest.fn().mockResolvedValue([
			{
				id: 'account-with-reserves',
				bankAccountNumber: 'CH1909000000151126386',
				description: 'Main account',
				reserves: [
					{ amountChf: '125.50', updatedAt: latestUpdatedAt },
					{ amountChf: '75.25', updatedAt: new Date('2026-08-11T12:00:00.000Z') },
				],
			},
			{
				id: 'account-with-reserve',
				bankAccountNumber: '',
				description: 'Secondary account',
				reserves: [{ amountChf: '24.50', updatedAt: null }],
			},
			{
				id: 'account-without-reserve',
				bankAccountNumber: '',
				description: null,
				reserves: [],
			},
		]);
		const db = { bankAccount: { findMany } };
		const service = new ReserveReadService(db as unknown as PrismaClient, {} as never);

		await expect(service.getLatestPerBankAccount()).resolves.toEqual({
			success: true,
			data: {
				accounts: [
					{
						bankAccountId: 'account-with-reserves',
						bankAccountNumber: 'CH1909000000151126386',
						description: 'Main account',
						amountChf: 125.5,
						updatedAt: latestUpdatedAt,
					},
					{
						bankAccountId: 'account-with-reserve',
						bankAccountNumber: '',
						description: 'Secondary account',
						amountChf: 24.5,
						updatedAt: null,
					},
					{
						bankAccountId: 'account-without-reserve',
						bankAccountNumber: '',
						description: null,
						amountChf: null,
						updatedAt: null,
					},
				],
				total: 150,
			},
		});
		expect(findMany).toHaveBeenCalledWith({
			select: {
				id: true,
				bankAccountNumber: true,
				description: true,
				reserves: {
					orderBy: { createdAt: 'desc' },
					take: 1,
					select: { amountChf: true, updatedAt: true },
				},
			},
		});
	});

	test('returns an empty account list and zero total when no bank accounts exist', async () => {
		const db = { bankAccount: { findMany: jest.fn().mockResolvedValue([]) } };
		const service = new ReserveReadService(db as unknown as PrismaClient, {} as never);

		await expect(service.getLatestPerBankAccount()).resolves.toEqual({
			success: true,
			data: {
				accounts: [],
				total: 0,
			},
		});
	});
});
