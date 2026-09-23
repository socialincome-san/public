import { fetchCustodianStablecoinWalletBalances } from './etherscan-balance.integration';

describe('fetchCustodianStablecoinWalletBalances', () => {
	const originalApiKey = process.env.ETHERSCAN_API_KEY;
	const originalFetch = global.fetch;
	const address = '0x8050AEE96939f3321Ae6EBd519feE88Ef172f223';

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

	test('fetches ETH and USDC balances in parallel', async () => {
		global.fetch = jest
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: jest.fn().mockResolvedValue({ status: '1', message: 'OK', result: '5210531526320999' }),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: jest.fn().mockResolvedValue({ status: '1', message: 'OK', result: '34987158' }),
			});

		await expect(fetchCustodianStablecoinWalletBalances([address])).resolves.toEqual({
			success: true,
			data: [
				{ address, amount: 0.005210531526320999, currency: 'ETH' },
				{ address, amount: 34.987158, currency: 'USD' },
			],
		});
		expect(global.fetch).toHaveBeenCalledTimes(2);
	});

	test('returns no balances without requiring an API key for an empty address list', async () => {
		delete process.env.ETHERSCAN_API_KEY;
		global.fetch = jest.fn();

		await expect(fetchCustodianStablecoinWalletBalances([])).resolves.toEqual({ success: true, data: [] });
		expect(global.fetch).not.toHaveBeenCalled();
	});

	test('fails when the API key is missing', async () => {
		delete process.env.ETHERSCAN_API_KEY;

		await expect(fetchCustodianStablecoinWalletBalances([address])).resolves.toEqual({
			success: false,
			error: 'Etherscan API key is not configured',
		});
	});

	test('returns a stable error for an invalid provider response', async () => {
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

		await expect(fetchCustodianStablecoinWalletBalances([address])).resolves.toEqual({
			success: false,
			error: 'Etherscan returned an invalid balance response',
		});
	});
});
