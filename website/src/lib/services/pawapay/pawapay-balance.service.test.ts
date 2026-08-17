import { PawaPayBalanceService } from './pawapay-balance.service';

jest.mock('@/generated/prisma/client', () => ({
	Currency: { GHS: 'GHS', SLE: 'SLE' },
	PrismaClient: class {},
}));

describe('PawaPayBalanceService.getLatestBalances', () => {
	const originalToken = process.env.PAWAPAY_API_TOKEN;
	const originalFetch = global.fetch;
	const service = new PawaPayBalanceService({} as never);

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

		await expect(service.getLatestBalances()).resolves.toEqual({
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

		await expect(service.getLatestBalances()).resolves.toEqual({
			success: false,
			error: 'PawaPay API token is not configured',
		});
	});

	test('fails when the request is unsuccessful', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: false,
			status: 401,
			statusText: 'Unauthorized',
		});

		await expect(service.getLatestBalances()).resolves.toEqual({
			success: false,
			error: 'PawaPay balance request failed: 401 Unauthorized',
		});
	});

	test('fails when a currency is invalid', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: jest.fn().mockResolvedValue({
				balances: [{ country: 'SLE', balance: '228.92', currency: 'UNKNOWN', provider: '' }],
			}),
		});

		await expect(service.getLatestBalances()).resolves.toEqual({
			success: false,
			error: 'Invalid PawaPay balance for country SLE',
		});
	});

	test('fails when a country is blank', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: jest.fn().mockResolvedValue({
				balances: [{ country: '   ', balance: '228.92', currency: 'SLE', provider: '' }],
			}),
		});

		await expect(service.getLatestBalances()).resolves.toEqual({
			success: false,
			error: 'Invalid PawaPay balance for country    ',
		});
	});

	test('fails when provider is missing', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: jest.fn().mockResolvedValue({
				balances: [{ country: 'SLE', balance: '228.92', currency: 'SLE' }],
			}),
		});

		await expect(service.getLatestBalances()).resolves.toEqual({
			success: false,
			error: 'Invalid PawaPay balance response',
		});
	});
});
