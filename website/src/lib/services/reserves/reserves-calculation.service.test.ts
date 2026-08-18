import { type PrismaClient } from '@/generated/prisma/client';
import { ReserveWriteService } from './reserve-write.service';
import { type ReserveCreateInput } from './reserve.types';
import { ReservesCalculationService } from './reserves-calculation.service';

jest.mock('@/generated/prisma/client', () => ({
	BankAccountType: {
		postfinance: 'postfinance',
		pawapay_wallet: 'pawapay_wallet',
		custodian_stablecoin_wallet: 'custodian_stablecoin_wallet',
	},
	Currency: { CHF: 'CHF', ETH: 'ETH', EUR: 'EUR', USD: 'USD' },
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

const pawaPayAccount = {
	id: 'pawapay-account-sle',
	type: 'pawapay_wallet',
	bankAccountNumber: null,
	description: 'SLE',
	createdAt: new Date(),
	updatedAt: null,
};

const custodianStablecoinWalletAccount = {
	id: 'custodian-stablecoin-wallet-account',
	type: 'custodian_stablecoin_wallet',
	bankAccountNumber: '0x8050AEE96939f3321Ae6EBd519feE88Ef172f223',
	description: 'Custodian stablecoin wallet',
	createdAt: new Date(),
	updatedAt: null,
};

type ReserveCreateManyArgs = { data: ReserveCreateInput[]; skipDuplicates?: boolean };

const createConflictSafeReserveDb = () => {
	const snapshots = new Map<string, ReserveCreateInput>();
	const createMany = jest.fn(({ data, skipDuplicates }: ReserveCreateManyArgs) => {
		let count = 0;

		for (const row of data) {
			const key = `${row.bankAccountId}:${row.date.toISOString()}:${row.currency}`;
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
			getLatestBalances: jest.fn().mockResolvedValue({
				success: true,
				data: [{ iban: 'CH1909000000151126386', amount: 125, currency: 'EUR' }],
			}),
		};
		const pawaPayBalanceService = {
			getLatestBalances: jest.fn().mockResolvedValue({ success: true, data: [] }),
		};
		const bankAccountWriteService = {
			ensurePawaPayWallets: jest.fn().mockResolvedValue({ success: true, data: [] }),
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
			bankAccountWriteService as never,
			postFinanceBalanceService as never,
			pawaPayBalanceService as never,
			{ getLatestBalances: jest.fn() } as never,
			{ createMany } as never,
			currencyDisplayService as never,
		);

		await expect(service.calculate()).resolves.toEqual({ success: true, data: 1 });
		expect(postFinanceBalanceService.getLatestBalances).toHaveBeenCalledWith(['CH19 0900 0000 1511 2638 6']);
		expect(pawaPayBalanceService.getLatestBalances).toHaveBeenCalledTimes(1);
		expect(bankAccountWriteService.ensurePawaPayWallets).toHaveBeenCalledWith([]);
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

	test('loads PawaPay balances, ensures wallet accounts, and writes converted reserves', async () => {
		const bankAccountService = {
			getAll: jest.fn().mockResolvedValue({ success: true, data: [] }),
		};
		const postFinanceBalanceService = { getLatestBalances: jest.fn() };
		const pawaPayBalanceService = {
			getLatestBalances: jest.fn().mockResolvedValue({
				success: true,
				data: [{ country: 'SLE', provider: '', amount: 228.92, currency: 'SLE' }],
			}),
		};
		const bankAccountWriteService = {
			ensurePawaPayWallets: jest.fn().mockResolvedValue({ success: true, data: [pawaPayAccount] }),
		};
		const createMany = jest.fn().mockResolvedValue({ success: true, data: 1 }) as jest.MockedFunction<
			(reserves: ReserveCreateInput[]) => Promise<{ success: true; data: number }>
		>;
		const reserveWriteService = { createMany };
		const currencyDisplayService = {
			getLatestRatesOrUndefined: jest.fn().mockResolvedValue({ CHF: 1, SLE: 25 }),
			convertAmount: jest.fn().mockReturnValue(9.1568),
		};
		const service = new ReservesCalculationService(
			{} as never,
			bankAccountService as never,
			bankAccountWriteService as never,
			postFinanceBalanceService as never,
			pawaPayBalanceService as never,
			{ getLatestBalances: jest.fn() } as never,
			reserveWriteService as never,
			currencyDisplayService as never,
		);

		await expect(service.calculate()).resolves.toEqual({ success: true, data: 1 });
		expect(postFinanceBalanceService.getLatestBalances).not.toHaveBeenCalled();
		expect(pawaPayBalanceService.getLatestBalances).toHaveBeenCalledTimes(1);
		expect(bankAccountWriteService.ensurePawaPayWallets).toHaveBeenCalledWith(['SLE']);
		const writtenReserves = createMany.mock.calls[0]?.[0] ?? [];
		expect(writtenReserves).toEqual([
			{
				bankAccountId: 'pawapay-account-sle',
				date: writtenReserves[0]?.date,
				amount: 228.92,
				currency: 'SLE',
				amountChf: 9.1568,
			},
		]);
		expect(writtenReserves[0]?.date).toBeInstanceOf(Date);
	});

	test('writes distinct reserves for provider-specific wallets in the same country', async () => {
		const orangeAccount = { ...pawaPayAccount, id: 'ghana-orange', description: 'GHA:ORANGE_GHA' };
		const mtnAccount = { ...pawaPayAccount, id: 'ghana-mtn', description: 'GHA:MTN_MOMO_GHA' };
		const bankAccountService = {
			getAll: jest.fn().mockResolvedValue({ success: true, data: [] }),
		};
		const postFinanceBalanceService = { getLatestBalances: jest.fn() };
		const pawaPayBalanceService = {
			getLatestBalances: jest.fn().mockResolvedValue({
				success: true,
				data: [
					{ country: 'GHA', provider: 'ORANGE_GHA', amount: 100, currency: 'SLE' },
					{ country: 'GHA', provider: 'MTN_MOMO_GHA', amount: 200, currency: 'SLE' },
				],
			}),
		};
		const bankAccountWriteService = {
			ensurePawaPayWallets: jest.fn().mockResolvedValue({
				success: true,
				data: [orangeAccount, mtnAccount],
			}),
		};
		const createMany = jest.fn().mockResolvedValue({ success: true, data: 2 }) as jest.MockedFunction<
			(reserves: ReserveCreateInput[]) => Promise<{ success: true; data: number }>
		>;
		const currencyDisplayService = {
			getLatestRatesOrUndefined: jest.fn().mockResolvedValue({ CHF: 1, SLE: 25 }),
			convertAmount: jest.fn().mockImplementation((amount: number) => amount / 25),
		};
		const service = new ReservesCalculationService(
			{} as never,
			bankAccountService as never,
			bankAccountWriteService as never,
			postFinanceBalanceService as never,
			pawaPayBalanceService as never,
			{ getLatestBalances: jest.fn() } as never,
			{ createMany } as never,
			currencyDisplayService as never,
		);

		await expect(service.calculate()).resolves.toEqual({ success: true, data: 2 });
		expect(bankAccountWriteService.ensurePawaPayWallets).toHaveBeenCalledWith(['GHA:ORANGE_GHA', 'GHA:MTN_MOMO_GHA']);
		const writtenReserves = createMany.mock.calls[0]?.[0] ?? [];
		expect(writtenReserves).toEqual([
			{
				bankAccountId: 'ghana-orange',
				date: writtenReserves[0]?.date,
				amount: 100,
				currency: 'SLE',
				amountChf: 4,
			},
			{
				bankAccountId: 'ghana-mtn',
				date: writtenReserves[1]?.date,
				amount: 200,
				currency: 'SLE',
				amountChf: 8,
			},
		]);
	});

	test('loads ETH and USDC balances for custodian wallets and writes separate reserves', async () => {
		const bankAccountService = {
			getAll: jest.fn().mockResolvedValue({ success: true, data: [custodianStablecoinWalletAccount] }),
		};
		const postFinanceBalanceService = { getLatestBalances: jest.fn() };
		const pawaPayBalanceService = {
			getLatestBalances: jest.fn().mockResolvedValue({ success: true, data: [] }),
		};
		const custodianStablecoinWalletService = {
			getLatestBalances: jest.fn().mockResolvedValue({
				success: true,
				data: [
					{
						address: custodianStablecoinWalletAccount.bankAccountNumber.toLowerCase(),
						amount: 0.005,
						currency: 'ETH',
					},
					{
						address: custodianStablecoinWalletAccount.bankAccountNumber,
						amount: 34.987158,
						currency: 'USD',
					},
				],
			}),
		};
		const bankAccountWriteService = {
			ensurePawaPayWallets: jest.fn().mockResolvedValue({ success: true, data: [] }),
		};
		const createMany = jest.fn().mockResolvedValue({ success: true, data: 2 }) as jest.MockedFunction<
			(reserves: ReserveCreateInput[]) => Promise<{ success: true; data: number }>
		>;
		const currencyDisplayService = {
			getLatestRatesOrUndefined: jest.fn().mockResolvedValue({ CHF: 0.8, ETH: 0.0004, USD: 1 }),
			convertAmount: jest
				.fn()
				.mockImplementation((_amount: number, currency: string) => (currency === 'ETH' ? 10 : 27.9897264)),
		};
		const service = new ReservesCalculationService(
			{} as never,
			bankAccountService as never,
			bankAccountWriteService as never,
			postFinanceBalanceService as never,
			pawaPayBalanceService as never,
			custodianStablecoinWalletService as never,
			{ createMany } as never,
			currencyDisplayService as never,
		);

		await expect(service.calculate()).resolves.toEqual({ success: true, data: 2 });
		expect(custodianStablecoinWalletService.getLatestBalances).toHaveBeenCalledWith([
			custodianStablecoinWalletAccount.bankAccountNumber,
		]);
		const writtenReserves = createMany.mock.calls[0]?.[0] ?? [];
		expect(writtenReserves).toEqual([
			{
				bankAccountId: custodianStablecoinWalletAccount.id,
				date: writtenReserves[0]?.date,
				amount: 0.005,
				currency: 'ETH',
				amountChf: 10,
			},
			{
				bankAccountId: custodianStablecoinWalletAccount.id,
				date: writtenReserves[1]?.date,
				amount: 34.987158,
				currency: 'USD',
				amountChf: 27.9897264,
			},
		]);
	});

	test('skips unsupported bank account types', async () => {
		const bankAccountService = {
			getAll: jest.fn().mockResolvedValue({
				success: true,
				data: [{ ...postFinanceAccount, type: 'local_bank' }],
			}),
		};
		const postFinanceBalanceService = { getLatestBalances: jest.fn() };
		const pawaPayBalanceService = {
			getLatestBalances: jest.fn().mockResolvedValue({ success: true, data: [] }),
		};
		const bankAccountWriteService = {
			ensurePawaPayWallets: jest.fn().mockResolvedValue({ success: true, data: [] }),
		};
		const reserveWriteService = { createMany: jest.fn().mockResolvedValue({ success: true, data: 0 }) };
		const service = new ReservesCalculationService(
			{} as never,
			bankAccountService as never,
			bankAccountWriteService as never,
			postFinanceBalanceService as never,
			pawaPayBalanceService as never,
			{ getLatestBalances: jest.fn() } as never,
			reserveWriteService as never,
			{} as never,
		);

		await expect(service.calculate()).resolves.toEqual({ success: true, data: 0 });
		expect(postFinanceBalanceService.getLatestBalances).not.toHaveBeenCalled();
		expect(reserveWriteService.createMany).toHaveBeenCalledWith([]);
	});

	test('repeating the same calculation persists only one snapshot', async () => {
		jest.useFakeTimers().setSystemTime(new Date('2026-08-12T12:00:00.000Z'));

		try {
			const { snapshots, db, createMany } = createConflictSafeReserveDb();
			const bankAccountService = {
				getAll: jest.fn().mockResolvedValue({ success: true, data: [postFinanceAccount] }),
			};
			const postFinanceBalanceService = {
				getLatestBalances: jest.fn().mockResolvedValue({
					success: true,
					data: [{ iban: 'CH1909000000151126386', amount: 125, currency: 'CHF' }],
				}),
			};
			const pawaPayBalanceService = {
				getLatestBalances: jest.fn().mockResolvedValue({ success: true, data: [] }),
			};
			const bankAccountWriteService = {
				ensurePawaPayWallets: jest.fn().mockResolvedValue({ success: true, data: [] }),
			};
			const currencyDisplayService = {
				getLatestRatesOrUndefined: jest.fn(),
				convertAmount: jest.fn().mockReturnValue(125),
			};
			const service = new ReservesCalculationService(
				{} as never,
				bankAccountService as never,
				bankAccountWriteService as never,
				postFinanceBalanceService as never,
				pawaPayBalanceService as never,
				{ getLatestBalances: jest.fn() } as never,
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
