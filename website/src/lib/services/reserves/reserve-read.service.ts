import { type PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';
import { type BankAccountLatestReserve, type LatestReserves } from './reserve.types';

export class ReserveReadService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	async getLatestPerBankAccount(): Promise<ServiceResult<LatestReserves>> {
		try {
			const bankAccounts = await this.db.bankAccount.findMany({
				select: {
					id: true,
					bankAccountNumber: true,
					description: true,
					reserves: {
						orderBy: { createdAt: 'desc' },
						take: 1,
						select: { amountChf: true, createdAt: true },
					},
				},
			});
			const accounts: BankAccountLatestReserve[] = bankAccounts.map(
				({ id, bankAccountNumber, description, reserves: [latestReserve] }) => ({
					bankAccountId: id,
					bankAccountNumber,
					description,
					amountChf: latestReserve ? Number(latestReserve.amountChf) : null,
					recordedAt: latestReserve?.createdAt ?? null,
				}),
			);

			return this.resultOk({
				accounts,
				total: accounts.reduce((total, { amountChf }) => total + (amountChf ?? 0), 0),
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not get latest reserves: ${JSON.stringify(error)}`);
		}
	}
}
