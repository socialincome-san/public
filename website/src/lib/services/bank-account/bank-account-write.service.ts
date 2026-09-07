import { BankAccountType, type BankAccount } from '@/generated/prisma/client';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';

export class BankAccountWriteService extends BaseService {
	async ensurePawaPayWallets(walletKeys: string[]): Promise<ServiceResult<BankAccount[]>> {
		const uniqueWalletKeys = [...new Set(walletKeys)];
		if (uniqueWalletKeys.length === 0) {
			return this.resultOk([]);
		}

		try {
			const existingAccounts = await this.db.bankAccount.findMany({
				where: {
					type: BankAccountType.pawapay_wallet,
					description: { in: uniqueWalletKeys },
				},
			});
			const existingWalletKeys = new Set(existingAccounts.map(({ description }) => description));
			const missingWalletKeys = uniqueWalletKeys.filter((walletKey) => !existingWalletKeys.has(walletKey));

			if (missingWalletKeys.length === 0) {
				return this.resultOk(existingAccounts);
			}

			await this.db.bankAccount.createMany({
				data: missingWalletKeys.map((walletKey) => ({
					type: BankAccountType.pawapay_wallet,
					bankAccountNumber: null,
					description: walletKey,
				})),
			});

			return this.resultOk(
				await this.db.bankAccount.findMany({
					where: {
						type: BankAccountType.pawapay_wallet,
						description: { in: uniqueWalletKeys },
					},
				}),
			);
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not ensure PawaPay wallet bank accounts: ${JSON.stringify(error)}`);
		}
	}
}
