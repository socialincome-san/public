const mockFindPawaPayWalletAccounts = jest.fn();
const mockCreatePawaPayWalletAccounts = jest.fn();

jest.mock('./bank-account.repository', () => ({
	findPawaPayWalletAccounts: mockFindPawaPayWalletAccounts,
	createPawaPayWalletAccounts: mockCreatePawaPayWalletAccounts,
}));

import { ensurePawaPayWallets } from './bank-account.service';

const existingAccount = {
	id: 'ghana',
	type: 'pawapay_wallet',
	bankAccountNumber: null,
	description: 'GHA',
	createdAt: new Date(),
	updatedAt: null,
};

describe('bank account service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('creates missing wallet accounts and returns all requested wallet keys', async () => {
		const createdAccount = {
			...existingAccount,
			id: 'ghana-mtn',
			description: 'GHA:MTN_MOMO_GHA',
		};
		mockFindPawaPayWalletAccounts
			.mockResolvedValueOnce([existingAccount])
			.mockResolvedValueOnce([existingAccount, createdAccount]);
		mockCreatePawaPayWalletAccounts.mockResolvedValue({ count: 1 });

		await expect(ensurePawaPayWallets(['GHA', 'GHA:MTN_MOMO_GHA', 'GHA:MTN_MOMO_GHA'])).resolves.toEqual({
			success: true,
			data: [existingAccount, createdAccount],
			status: undefined,
		});
		expect(mockCreatePawaPayWalletAccounts).toHaveBeenCalledWith(['GHA:MTN_MOMO_GHA']);
	});

	test('does not query the database when no wallet keys are requested', async () => {
		await expect(ensurePawaPayWallets([])).resolves.toEqual({
			success: true,
			data: [],
			status: undefined,
		});
		expect(mockFindPawaPayWalletAccounts).not.toHaveBeenCalled();
	});

	test('returns existing accounts without creating when all keys exist', async () => {
		mockFindPawaPayWalletAccounts.mockResolvedValue([existingAccount]);

		await expect(ensurePawaPayWallets(['GHA'])).resolves.toEqual({
			success: true,
			data: [existingAccount],
			status: undefined,
		});
		expect(mockFindPawaPayWalletAccounts).toHaveBeenCalledTimes(1);
		expect(mockCreatePawaPayWalletAccounts).not.toHaveBeenCalled();
	});
});
