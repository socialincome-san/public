import { BankAccountWriteService } from './bank-account-write.service';

jest.mock('@/generated/prisma/client', () => ({
	BankAccountType: { pawapay_wallet: 'pawapay_wallet' },
	PrismaClient: class {},
}));

describe('BankAccountWriteService.ensurePawaPayWallets', () => {
	test('creates missing wallet accounts and returns all requested wallet keys', async () => {
		const existingAccount = {
			id: 'ghana',
			type: 'pawapay_wallet',
			bankAccountNumber: null,
			description: 'GHA',
			createdAt: new Date(),
			updatedAt: null,
		};
		const createdAccount = { ...existingAccount, id: 'ghana-mtn', description: 'GHA:MTN_MOMO_GHA' };
		const findMany = jest
			.fn()
			.mockResolvedValueOnce([existingAccount])
			.mockResolvedValueOnce([existingAccount, createdAccount]);
		const createMany = jest.fn().mockResolvedValue({ count: 1 });
		const service = new BankAccountWriteService({ bankAccount: { findMany, createMany } } as never);

		await expect(service.ensurePawaPayWallets(['GHA', 'GHA:MTN_MOMO_GHA', 'GHA:MTN_MOMO_GHA'])).resolves.toEqual({
			success: true,
			data: [existingAccount, createdAccount],
		});
		expect(createMany).toHaveBeenCalledWith({
			data: [
				{
					type: 'pawapay_wallet',
					bankAccountNumber: null,
					description: 'GHA:MTN_MOMO_GHA',
				},
			],
		});
	});

	test('does not query the database when no countries are requested', async () => {
		const findMany = jest.fn();
		const service = new BankAccountWriteService({ bankAccount: { findMany } } as never);

		await expect(service.ensurePawaPayWallets([])).resolves.toEqual({ success: true, data: [] });
		expect(findMany).not.toHaveBeenCalled();
	});

	test('returns existing accounts without creating when all countries already exist', async () => {
		const existingAccount = {
			id: 'ghana',
			type: 'pawapay_wallet',
			bankAccountNumber: null,
			description: 'GHA',
			createdAt: new Date(),
			updatedAt: null,
		};
		const findMany = jest.fn().mockResolvedValue([existingAccount]);
		const createMany = jest.fn();
		const service = new BankAccountWriteService({ bankAccount: { findMany, createMany } } as never);

		await expect(service.ensurePawaPayWallets(['GHA'])).resolves.toEqual({
			success: true,
			data: [existingAccount],
		});
		expect(findMany).toHaveBeenCalledTimes(1);
		expect(createMany).not.toHaveBeenCalled();
	});
});
