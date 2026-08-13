import { BankAccountWriteService } from './bank-account-write.service';

jest.mock('@/generated/prisma/client', () => ({
	BankAccountType: { pawapay_wallet: 'pawapay_wallet' },
	PrismaClient: class {},
}));

describe('BankAccountWriteService.ensurePawaPayWallets', () => {
	test('creates missing wallet accounts and returns all requested countries', async () => {
		const existingAccount = {
			id: 'ghana',
			type: 'pawapay_wallet',
			bankAccountNumber: null,
			description: 'GHA',
			createdAt: new Date(),
			updatedAt: null,
		};
		const createdAccount = { ...existingAccount, id: 'sierra-leone', description: 'SLE' };
		const findMany = jest
			.fn()
			.mockResolvedValueOnce([existingAccount])
			.mockResolvedValueOnce([existingAccount, createdAccount]);
		const createMany = jest.fn().mockResolvedValue({ count: 1 });
		const service = new BankAccountWriteService({ bankAccount: { findMany, createMany } } as never);

		await expect(service.ensurePawaPayWallets(['GHA', 'SLE', 'SLE'])).resolves.toEqual({
			success: true,
			data: [existingAccount, createdAccount],
		});
		expect(createMany).toHaveBeenCalledWith({
			data: [
				{
					type: 'pawapay_wallet',
					bankAccountNumber: null,
					description: 'SLE',
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
});
