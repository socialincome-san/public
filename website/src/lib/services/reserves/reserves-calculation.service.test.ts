import { type PrismaClient } from '@/generated/prisma/client';
import { ReserveWriteService } from './reserve-write.service';
import { type ReserveCreateInput } from './reserve.types';
import { ReservesCalculationService } from './reserves-calculation.service';

jest.mock('@/generated/prisma/client', () => ({
	BankAccountType: {
		postfinance: 'postfinance',
		pawapay_wallet: 'pawapay_wallet',
	},
	Currency: { CHF: 'CHF', EUR: 'EUR' },
	PrismaClient: class {},
}));
jest.mock('@/lib/firebase/firebase-admin', () => ({
	storageAdmin: { storage: { bucket: () => ({}) } },
}));

const postFinanceAccount = {
	id: 'postfinance-account',
	type: 'postfinance',
	bankAccountNumber: 'CH19 0900 0000 1511 2638 6',
	description: null,
	createdAt: new Date(),
	updatedAt: null,
};

type ReserveCreateManyArgs = { data: ReserveCreateInput[]; skipDuplicates?: boolean };

const createConflictSafeReserveDb = () => {
	const snapshots = new Map<string, ReserveCreateInput>();
	const createMany = jest.fn(({ data, skipDuplicates }: ReserveCreateManyArgs) => {
		let count = 0;

		for (const row of data) {
			const key = `${row.bankAccountId}:${row.date.toISOString()}`;
			if (snapshots.has(key)) {
				if (!skipDuplicates) {
					throw new Error(`Duplicate reserve for ${key}`);
				}
				continue;
			}

			snapshots.set(key, row);
			count += 1;
		}

		return Promise.resolve({ count });
	}) as jest.MockedFunction<(args: ReserveCreateManyArgs) => Promise<{ count: number }>>;

	return {
		snapshots,
		db: { reserve: { createMany } } as unknown as PrismaClient,
		createMany,
	};
};

describe('ReservesCalculationService.calculate', () => {
	test('loads PostFinance balances and writes converted reserves', async () => {
		const bankAccountService = {
			getAll: jest.fn().mockResolvedValue({ success: true, data: [postFinanceAccount] }),
		};
		const postFinanceBalanceService = {
			getLatestClavBalances: jest.fn().mockResolvedValue({
				success: true,
				data: [{ iban: 'CH1909000000151126386', amount: 125, currency: 'EUR' }],
			}),
		};
		const createMany = jest.fn().mockResolvedValue({ success: true, data: 1 }) as jest.MockedFunction<
			(reserves: ReserveCreateInput[]) => Promise<{ success: true; data: number }>
		>;
		const currencyDisplayService = {
			getLatestRatesOrUndefined: jest.fn().mockResolvedValue({ CHF: 1, EUR: 2 }),
			convertAmount: jest.fn().mockReturnValue(62.5),
		};
		const service = new ReservesCalculationService(
			{} as never,
			bankAccountService as never,
			postFinanceBalanceService as never,
			{ createMany } as never,
			currencyDisplayService as never,
		);

		await expect(service.calculate()).resolves.toEqual({ success: true, data: 1 });
		expect(postFinanceBalanceService.getLatestClavBalances).toHaveBeenCalledWith(['CH19 0900 0000 1511 2638 6']);
		expect(createMany).toHaveBeenCalledTimes(1);
		const writtenReserves = createMany.mock.calls[0]?.[0] ?? [];
		expect(writtenReserves).toEqual([
			{
				bankAccountId: 'postfinance-account',
				date: writtenReserves[0]?.date,
				amount: 125,
				currency: 'EUR',
				amountChf: 62.5,
			},
		]);
		expect(writtenReserves[0]?.date).toBeInstanceOf(Date);
	});

	test('skips unsupported bank account types', async () => {
		const bankAccountService = {
			getAll: jest.fn().mockResolvedValue({
				success: true,
				data: [{ ...postFinanceAccount, type: 'pawapay_wallet' }],
			}),
		};
		const postFinanceBalanceService = { getLatestClavBalances: jest.fn() };
		const reserveWriteService = { createMany: jest.fn() };
		const service = new ReservesCalculationService(
			{} as never,
			bankAccountService as never,
			postFinanceBalanceService as never,
			reserveWriteService as never,
			{} as never,
		);

		await expect(service.calculate()).resolves.toEqual({ success: true, data: 0 });
		expect(postFinanceBalanceService.getLatestClavBalances).not.toHaveBeenCalled();
		expect(reserveWriteService.createMany).not.toHaveBeenCalled();
	});

	test('repeating the same calculation persists only one snapshot', async () => {
		jest.useFakeTimers().setSystemTime(new Date('2026-08-12T12:00:00.000Z'));

		try {
			const { snapshots, db, createMany } = createConflictSafeReserveDb();
			const bankAccountService = {
				getAll: jest.fn().mockResolvedValue({ success: true, data: [postFinanceAccount] }),
			};
			const postFinanceBalanceService = {
				getLatestClavBalances: jest.fn().mockResolvedValue({
					success: true,
					data: [{ iban: 'CH1909000000151126386', amount: 125, currency: 'CHF' }],
				}),
			};
			const currencyDisplayService = {
				getLatestRatesOrUndefined: jest.fn(),
				convertAmount: jest.fn().mockReturnValue(125),
			};
			const service = new ReservesCalculationService(
				{} as never,
				bankAccountService as never,
				postFinanceBalanceService as never,
				new ReserveWriteService(db, {} as never),
				currencyDisplayService as never,
			);

			await expect(service.calculate()).resolves.toEqual({ success: true, data: 1 });
			await expect(service.calculate()).resolves.toEqual({ success: true, data: 0 });

			expect(createMany).toHaveBeenCalledTimes(2);
			const firstWrite = createMany.mock.calls[0]?.[0];
			expect(firstWrite).toEqual({
				data: [
					{
						bankAccountId: 'postfinance-account',
						date: new Date('2026-08-12T00:00:00.000Z'),
						amount: 125,
						currency: 'CHF',
						amountChf: 125,
					},
				],
				skipDuplicates: true,
			});
			expect(snapshots.size).toBe(1);
		} finally {
			jest.useRealTimers();
		}
	});
});
