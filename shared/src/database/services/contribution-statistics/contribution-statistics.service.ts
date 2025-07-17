import { ContributionStats } from '@socialincome/shared/src/utils/stats/ContributionStatsCalculator';
import { BaseService } from '../core/base.service';

export class ContributionStatisticsService extends BaseService {
	async getAll(): Promise<ContributionStats> {
		try {
			const stats = await this.db.contributionStatistics.findFirst();

			return {
				totalContributionsAmount: stats?.totalContributionsAmount ?? 0,
				totalContributionsCount: stats?.totalContributionsCount ?? 0,
				totalContributorsCount: stats?.totalContributorsCount ?? 0,
				totalIndividualContributionsAmount: stats?.totalIndividualContributionsAmount ?? 0,
				totalIndividualContributorsCount: stats?.totalIndividualContributorsCount ?? 0,
				totalInstitutionalContributionsAmount: stats?.totalInstitutionalContributionsAmount ?? 0,
				totalInstitutionalContributorsCount: stats?.totalInstitutionalContributorsCount ?? 0,

				totalContributionsByCurrency: (stats?.totalContributionsByCurrency as Record<string, string | number>[]) ?? [],
				totalContributionsByIsInstitution:
					(stats?.totalContributionsByIsInstitution as Record<string, string | number>[]) ?? [],
				totalContributionsByCountry: (stats?.totalContributionsByCountry as Record<string, string | number>[]) ?? [],
				totalContributionsBySource: (stats?.totalContributionsBySource as Record<string, string | number>[]) ?? [],
				totalContributionsByMonth: (stats?.totalContributionsByMonth as Record<string, string | number>[]) ?? [],
				totalContributionsByMonthAndType:
					(stats?.totalContributionsByMonthAndType as Record<string, string | number>[]) ?? [],
				totalPaymentFeesByIsInstitution:
					(stats?.totalPaymentFeesByIsInstitution as Record<string, string | number>[]) ?? [],
			};
		} catch (error) {
			console.error('[ContributionStatisticsService.getAll] Failed to load stats:', error);
			return {
				totalContributionsAmount: 0,
				totalContributionsCount: 0,
				totalContributorsCount: 0,
				totalIndividualContributionsAmount: 0,
				totalIndividualContributorsCount: 0,
				totalInstitutionalContributionsAmount: 0,
				totalInstitutionalContributorsCount: 0,
				totalContributionsByCurrency: [],
				totalContributionsByIsInstitution: [],
				totalContributionsByCountry: [],
				totalContributionsBySource: [],
				totalContributionsByMonth: [],
				totalContributionsByMonthAndType: [],
				totalPaymentFeesByIsInstitution: [],
			};
		}
	}
}
