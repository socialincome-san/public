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
		const reserveWriteService = {
			createMany: jest.fn().mockResolvedValue({ success: true, data: 1 }),
		};
		const currencyDisplayService = {
			getLatestRatesOrUndefined: jest.fn().mockResolvedValue({ CHF: 1, EUR: 2 }),
			convertAmount: jest.fn().mockReturnValue(62.5),
		};
		const service = new ReservesCalculationService(
			{} as never,
			bankAccountService as never,
			postFinanceBalanceService as never,
			reserveWriteService as never,
			currencyDisplayService as never,
		);

		await expect(service.calculate()).resolves.toEqual({ success: true, data: 1 });
		expect(postFinanceBalanceService.getLatestClavBalances).toHaveBeenCalledWith(['CH19 0900 0000 1511 2638 6']);
		expect(reserveWriteService.createMany).toHaveBeenCalledWith([
			{
				bankAccountId: 'postfinance-account',
				amount: 125,
				currency: 'EUR',
				amountChf: 62.5,
			},
		]);
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
});
