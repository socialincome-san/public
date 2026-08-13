import { BankAccountType, type BankAccount, type PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';

export class BankAccountWriteService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	async ensurePawaPayWallets(countries: string[]): Promise<ServiceResult<BankAccount[]>> {
		const uniqueCountries = [...new Set(countries)];
		if (uniqueCountries.length === 0) {
			return this.resultOk([]);
		}

		try {
			const existingAccounts = await this.db.bankAccount.findMany({
				where: {
					type: BankAccountType.pawapay_wallet,
					description: { in: uniqueCountries },
				},
			});
			const existingCountries = new Set(existingAccounts.map(({ description }) => description));
			const missingCountries = uniqueCountries.filter((country) => !existingCountries.has(country));

			if (missingCountries.length > 0) {
				await this.db.bankAccount.createMany({
					data: missingCountries.map((country) => ({
						type: BankAccountType.pawapay_wallet,
						bankAccountNumber: null,
						description: country,
					})),
				});
			}

			return this.resultOk(
				await this.db.bankAccount.findMany({
					where: {
						type: BankAccountType.pawapay_wallet,
						description: { in: uniqueCountries },
					},
				}),
			);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not ensure PawaPay wallet bank accounts: ${JSON.stringify(error)}`);
		}
	}
}
