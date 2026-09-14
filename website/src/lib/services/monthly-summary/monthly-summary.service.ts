import { PrismaClient } from '@/generated/prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

export type MonthlySummary = {
	period: { from: Date; to: Date };
	moneyIn: { amountChf: number; count: number };
	moneyOut: { amountChf: number; count: number };
	new: { contributors: number; campaigns: number; programs: number; recipients: number };
};

export class MonthlySummaryService extends BaseService {
	constructor(db: PrismaClient) {
		super(db);
	}

	async getLastMonth(): Promise<ServiceResult<MonthlySummary>> {
		try {
			const now = new Date();
			const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
			const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
			const [contributions, payouts, contributors, campaigns, programs, recipients] = await Promise.all([
				this.db.contribution.aggregate({
					where: { status: 'succeeded', createdAt: { gte: from, lt: to } },
					_sum: { amountChf: true },
					_count: { _all: true },
				}),
				this.db.payout.aggregate({
					where: { status: 'paid', paymentAt: { gte: from, lt: to } },
					_sum: { amountChf: true },
					_count: { _all: true },
				}),
				this.db.contributor.count({ where: { createdAt: { gte: from, lt: to } } }),
				this.db.campaign.count({ where: { createdAt: { gte: from, lt: to } } }),
				this.db.program.count({ where: { createdAt: { gte: from, lt: to } } }),
				this.db.recipient.count({ where: { createdAt: { gte: from, lt: to } } }),
			]);

			return this.resultOk({
				period: { from, to },
				moneyIn: { amountChf: Number(contributions._sum.amountChf ?? 0), count: contributions._count._all },
				moneyOut: { amountChf: Number(payouts._sum.amountChf ?? 0), count: payouts._count._all },
				new: { contributors, campaigns, programs, recipients },
			});
		} catch (error) {
			return this.resultFail(`Unable to load monthly summary: ${String(error)}`);
		}
	}
}
