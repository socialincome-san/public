import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';
import { type BankAccountLatestReserve, type LatestReserves } from './reserve.types';

export class ReserveReadService extends BaseService {
	async getLatestPerBankAccount(): Promise<ServiceResult<LatestReserves>> {
		try {
			const latestDates = await this.db.reserve.groupBy({
				by: ['bankAccountId'],
				_max: { date: true },
			});
			const latestReserveFilters = latestDates.flatMap(({ bankAccountId, _max: { date } }) =>
				date ? [{ bankAccountId, date }] : [],
			);
			const [bankAccounts, latestReserves] = await Promise.all([
				this.db.bankAccount.findMany({
					select: {
						id: true,
						bankAccountNumber: true,
						description: true,
					},
				}),
				latestReserveFilters.length > 0
					? this.db.reserve.findMany({
							where: { OR: latestReserveFilters },
							select: {
								bankAccountId: true,
								amountChf: true,
								createdAt: true,
							},
						})
					: Promise.resolve([]),
			]);
			const latestTotalsByBankAccount = new Map<string, { amountChf: number; recordedAt: Date }>();
			for (const reserve of latestReserves) {
				const current = latestTotalsByBankAccount.get(reserve.bankAccountId);
				latestTotalsByBankAccount.set(reserve.bankAccountId, {
					amountChf: (current?.amountChf ?? 0) + Number(reserve.amountChf),
					recordedAt: current && current.recordedAt > reserve.createdAt ? current.recordedAt : reserve.createdAt,
				});
			}
			const accounts: BankAccountLatestReserve[] = bankAccounts.map(({ id, bankAccountNumber, description }) => {
				const latestReserve = latestTotalsByBankAccount.get(id);

				return {
					bankAccountId: id,
					bankAccountNumber,
					description,
					amountChf: latestReserve?.amountChf ?? null,
					recordedAt: latestReserve?.recordedAt ?? null,
				};
			});

			return this.resultOk({
				accounts,
				total: accounts.reduce((total, { amountChf }) => total + (amountChf ?? 0), 0),
			});
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not get latest reserves: ${JSON.stringify(error)}`);
		}
	}
}
