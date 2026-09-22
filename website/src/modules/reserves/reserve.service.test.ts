const mockGroupLatestReserveDates = jest.fn();
const mockFindReservesByAccountAndDate = jest.fn();
const mockCreateReserves = jest.fn();
const mockGetBankAccounts = jest.fn();
const mockGetBankAccountSummaries = jest.fn();
const mockEnsurePawaPayWallets = jest.fn();
const mockGetLatestPostFinanceBalances = jest.fn();
const mockFetchPawaPayBalances = jest.fn();
const mockFetchCustodianBalances = jest.fn();
const mockGetLatestRates = jest.fn();
const mockConvertAmount = jest.fn();

jest.mock('./reserve.repository', () => ({
	groupLatestReserveDates: mockGroupLatestReserveDates,
	findReservesByAccountAndDate: mockFindReservesByAccountAndDate,
	createReserves: mockCreateReserves,
}));
jest.mock('@/modules/bank-accounts/bank-account.service', () => ({
	getBankAccounts: mockGetBankAccounts,
	getBankAccountSummaries: mockGetBankAccountSummaries,
	ensurePawaPayWallets: mockEnsurePawaPayWallets,
}));
jest.mock('@/modules/payment-imports/payment-import.service', () => ({
	getLatestPostFinanceBalances: mockGetLatestPostFinanceBalances,
}));
jest.mock('@/integrations/pawapay/pawapay-balance.integration', () => ({
	fetchPawaPayBalances: mockFetchPawaPayBalances,
}));
jest.mock('@/integrations/etherscan/etherscan-balance.integration', () => ({
	fetchCustodianStablecoinWalletBalances: mockFetchCustodianBalances,
}));
jest.mock('@/modules/exchange-rates/exchange-rate.service', () => ({
	getLatestRates: mockGetLatestRates,
}));
jest.mock('@/modules/currency-display/currency-display.service', () => ({
	convertAmount: mockConvertAmount,
}));

import { calculateReserves, getLatestReserves } from './reserve.service';

describe('reserve service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns the latest summed reserves for every bank account', async () => {
		const latestDate = new Date('2026-08-12T00:00:00.000Z');
		const recordedAt = new Date('2026-08-12T12:00:00.000Z');
		mockGroupLatestReserveDates.mockResolvedValue([{ bankAccountId: 'account-with-reserves', _max: { date: latestDate } }]);
		mockFindReservesByAccountAndDate.mockResolvedValue([
			{ bankAccountId: 'account-with-reserves', amountChf: '100.00', createdAt: recordedAt },
			{ bankAccountId: 'account-with-reserves', amountChf: '25.50', createdAt: recordedAt },
		]);
		mockGetBankAccountSummaries.mockResolvedValue({
			success: true,
			data: [
				{ id: 'account-with-reserves', bankAccountNumber: 'CH123', description: 'Main account' },
				{ id: 'account-without-reserves', bankAccountNumber: null, description: null },
			],
		});

		await expect(getLatestReserves()).resolves.toEqual({
			success: true,
			data: {
				accounts: [
					{
						bankAccountId: 'account-with-reserves',
						bankAccountNumber: 'CH123',
						description: 'Main account',
						amountChf: 125.5,
						recordedAt,
					},
					{
						bankAccountId: 'account-without-reserves',
						bankAccountNumber: null,
						description: null,
						amountChf: null,
						recordedAt: null,
					},
				],
				total: 125.5,
			},
		});
		expect(mockFindReservesByAccountAndDate).toHaveBeenCalledWith([
			{ bankAccountId: 'account-with-reserves', date: latestDate },
		]);
	});

	test('reconciles PostFinance, PawaPay, and custodian balances into reserves', async () => {
		jest.useFakeTimers().setSystemTime(new Date('2026-08-12T12:00:00.000Z'));
		try {
			const custodianAddress = '0x8050AEE96939f3321Ae6EBd519feE88Ef172f223';
			mockGetBankAccounts.mockResolvedValue({
				success: true,
				data: [
					{
						id: 'postfinance',
						type: 'postfinance',
						bankAccountNumber: 'CH19 0900',
						description: null,
						createdAt: new Date(),
						updatedAt: null,
					},
					{
						id: 'custodian',
						type: 'custodian_stablecoin_wallet',
						bankAccountNumber: custodianAddress,
						description: null,
						createdAt: new Date(),
						updatedAt: null,
					},
				],
			});
			mockGetLatestPostFinanceBalances.mockResolvedValue({
				success: true,
				data: [{ iban: 'CH190900', amount: 125, currency: 'EUR' }],
			});
			mockFetchPawaPayBalances.mockResolvedValue({
				success: true,
				data: [{ country: 'SLE', provider: '', amount: 228.92, currency: 'SLE' }],
			});
			mockFetchCustodianBalances.mockResolvedValue({
				success: true,
				data: [
					{ address: custodianAddress.toLowerCase(), amount: 0.005, currency: 'ETH' },
					{ address: custodianAddress, amount: 34.98, currency: 'USD' },
				],
			});
			mockEnsurePawaPayWallets.mockResolvedValue({
				success: true,
				data: [
					{
						id: 'pawapay',
						type: 'pawapay_wallet',
						bankAccountNumber: null,
						description: 'SLE',
						createdAt: new Date(),
						updatedAt: null,
					},
				],
			});
			mockGetLatestRates.mockResolvedValue({ success: true, data: { CHF: 1, EUR: 2, SLE: 25, ETH: 0.0004, USD: 1 } });
			mockConvertAmount.mockImplementation((amount: number) => ({ success: true, data: amount / 2 }));
			mockCreateReserves.mockResolvedValue({ count: 4 });

			await expect(calculateReserves('payments-bucket')).resolves.toEqual({ success: true, data: 4 });
			expect(mockGetLatestPostFinanceBalances).toHaveBeenCalledWith('payments-bucket', ['CH19 0900']);
			expect(mockEnsurePawaPayWallets).toHaveBeenCalledWith(['SLE']);
			expect(mockCreateReserves).toHaveBeenCalledWith([
				{
					bankAccountId: 'postfinance',
					date: new Date('2026-08-12T00:00:00.000Z'),
					amount: 125,
					currency: 'EUR',
					amountChf: 62.5,
				},
				{
					bankAccountId: 'pawapay',
					date: new Date('2026-08-12T00:00:00.000Z'),
					amount: 228.92,
					currency: 'SLE',
					amountChf: 114.46,
				},
				{
					bankAccountId: 'custodian',
					date: new Date('2026-08-12T00:00:00.000Z'),
					amount: 0.005,
					currency: 'ETH',
					amountChf: 0.0025,
				},
				{
					bankAccountId: 'custodian',
					date: new Date('2026-08-12T00:00:00.000Z'),
					amount: 34.98,
					currency: 'USD',
					amountChf: 17.49,
				},
			]);
		} finally {
			jest.useRealTimers();
		}
	});

	test('does not write when no supported balances exist', async () => {
		mockGetBankAccounts.mockResolvedValue({ success: true, data: [] });
		mockFetchPawaPayBalances.mockResolvedValue({ success: true, data: [] });
		mockEnsurePawaPayWallets.mockResolvedValue({ success: true, data: [] });

		await expect(calculateReserves('payments-bucket')).resolves.toEqual({ success: true, data: 0 });
		expect(mockCreateReserves).not.toHaveBeenCalled();
	});
});
