import { CustodianStablecoinWalletService } from './custodian-stablecoin-wallet.service';

jest.mock('@/generated/prisma/client', () => ({
	Currency: { ETH: 'ETH', USD: 'USD' },
	PrismaClient: class {},
}));

describe('CustodianStablecoinWalletService.getLatestBalances', () => {
	const originalApiKey = process.env.ETHERSCAN_API_KEY;
	const originalFetch = global.fetch;
	const address = '0x8050AEE96939f3321Ae6EBd519feE88Ef172f223';
	const service = new CustodianStablecoinWalletService({} as never);

	beforeEach(() => {
		process.env.ETHERSCAN_API_KEY = 'test-etherscan-key';
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	afterAll(() => {
		if (originalApiKey === undefined) {
			delete process.env.ETHERSCAN_API_KEY;
		} else {
			process.env.ETHERSCAN_API_KEY = originalApiKey;
		}
	});

	test('fetches ETH and USDC balances in parallel and maps them to ETH and USD', async () => {
		global.fetch = jest
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: jest.fn().mockResolvedValue({
					status: '1',
					message: 'OK',
					result: '5210531526320999',
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: jest.fn().mockResolvedValue({
					status: '1',
					message: 'OK',
					result: '34987158',
				}),
			});

		const balancesResult = service.getLatestBalances([address]);

		expect(global.fetch).toHaveBeenCalledTimes(2);
		await expect(balancesResult).resolves.toEqual({
			success: true,
			data: [
				{ address, amount: 0.005210531526320999, currency: 'ETH' },
				{ address, amount: 34.987158, currency: 'USD' },
			],
		});
		expect(global.fetch).toHaveBeenNthCalledWith(
			1,
			`https://api.etherscan.io/v2/api?module=account&action=balance&apikey=test-etherscan-key&chainid=1&address=${address}`,
			{ method: 'GET' },
		);
		expect(global.fetch).toHaveBeenNthCalledWith(
			2,
			`https://api.etherscan.io/v2/api?module=account&action=tokenbalance&chainid=1&contractaddress=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&address=${address}&tag=latest&apikey=test-etherscan-key`,
			{ method: 'GET' },
		);
	});

	test('returns no balances without requiring an API key when no addresses are provided', async () => {
		delete process.env.ETHERSCAN_API_KEY;
		global.fetch = jest.fn();

		await expect(service.getLatestBalances([])).resolves.toEqual({ success: true, data: [] });
		expect(global.fetch).not.toHaveBeenCalled();
	});

	test('fails when the API key is missing', async () => {
		delete process.env.ETHERSCAN_API_KEY;

		await expect(service.getLatestBalances([address])).resolves.toEqual({
			success: false,
			error: 'Etherscan API key is not configured',
		});
	});

	test('fails when an Etherscan response has an unsuccessful status', async () => {
		global.fetch = jest
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: jest.fn().mockResolvedValue({ status: '0', message: 'NOTOK', result: '0' }),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: jest.fn().mockResolvedValue({ status: '1', message: 'OK', result: '0' }),
			});

		const result = await service.getLatestBalances([address]);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain('Could not get custodian stablecoin wallet balances');
		}
	});

	test('fails when an Etherscan result is not numeric', async () => {
		global.fetch = jest
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: jest.fn().mockResolvedValue({ status: '1', message: 'OK', result: 'not-a-balance' }),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: jest.fn().mockResolvedValue({ status: '1', message: 'OK', result: '0' }),
			});

		const result = await service.getLatestBalances([address]);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain('Could not get custodian stablecoin wallet balances');
		}
	});
});
