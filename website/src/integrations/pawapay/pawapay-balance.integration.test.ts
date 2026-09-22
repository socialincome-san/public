import { fetchPawaPayBalances } from './pawapay-balance.integration';

describe('fetchPawaPayBalances', () => {
	const originalToken = process.env.PAWAPAY_API_TOKEN;
	const originalFetch = global.fetch;

	beforeEach(() => {
		process.env.PAWAPAY_API_TOKEN = 'test-token';
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	afterAll(() => {
		if (originalToken === undefined) {
			delete process.env.PAWAPAY_API_TOKEN;
		} else {
			process.env.PAWAPAY_API_TOKEN = originalToken;
		}
	});

	test('fetches and maps wallet balances', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: jest.fn().mockResolvedValue({
				balances: [
					{ country: 'SLE', balance: '228.92', currency: 'SLE', provider: '' },
					{ country: 'GHA', balance: '144.14', currency: 'GHS', provider: ' MTN_MOMO_GHA ' },
				],
			}),
		});

		await expect(fetchPawaPayBalances()).resolves.toEqual({
			success: true,
			data: [
				{ country: 'SLE', provider: '', amount: 228.92, currency: 'SLE' },
				{ country: 'GHA', provider: 'MTN_MOMO_GHA', amount: 144.14, currency: 'GHS' },
			],
		});
		expect(global.fetch).toHaveBeenCalledWith('https://api.pawapay.io/v2/wallet-balances', {
			method: 'GET',
			headers: { Authorization: 'Bearer test-token' },
		});
	});

	test('fails when the API token is missing', async () => {
		delete process.env.PAWAPAY_API_TOKEN;

		await expect(fetchPawaPayBalances()).resolves.toEqual({
			success: false,
			error: 'PawaPay API token is not configured',
		});
	});

	test('fails when the response is invalid', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: jest.fn().mockResolvedValue({
				balances: [{ country: 'SLE', balance: '228.92', currency: 'UNKNOWN', provider: '' }],
			}),
		});

		await expect(fetchPawaPayBalances()).resolves.toEqual({
			success: false,
			error: 'Invalid PawaPay balance for country SLE',
		});
	});
});
