import { ContributionStatistics as PrismaContributionStatistics } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

export class ContributionStatisticsService extends BaseService {
	async getAll(): Promise<ServiceResult<PrismaContributionStatistics>> {
		try {
			const statistics = await this.db.contributionStatistics.findFirst();

			if (!statistics) {
				return this.resultFail('No contribution statistics available');
			}

			return this.resultOk(statistics);
		} catch (e) {
			console.error('[ContributionStatisticsService.getAll]', e);
			return this.resultFail('Could not fetch contribution statistics');
		}
	}
}
