import { ContributionStats as PrismaContributionStats } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

export class ContributionStatsService extends BaseService {
	async getAll(): Promise<ServiceResult<PrismaContributionStats>> {
		try {
			const stats = await this.db.contributionStats.findFirst();

			if (!stats) {
				return this.resultFail('No stats available');
			}

			return this.resultOk(stats);
		} catch (e) {
			console.error('[ContributionService.getStats]', e);
			return this.resultFail('Could not fetch contribution stats');
		}
	}
}
