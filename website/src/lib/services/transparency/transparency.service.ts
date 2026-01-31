import { getCountryNameByCode } from '@/lib/types/country';
import { CountryCode } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	ContributionsByCountry,
	ContributionTimeRange,
	TimeRange,
	TransparencyData,
	TransparencyTotals,
} from './transparency.types';

export class TransparencyService extends BaseService {
	async getTransparencyData(timeRanges: TimeRange[]): Promise<ServiceResult<TransparencyData>> {
		try {
			const [totals, timeRangeData, topCountries] = await Promise.all([
				this.getTotals(),
				this.getContributionsByTimeRanges(timeRanges),
				this.getContributionsByCountry(15),
			]);

			return this.resultOk({ totals, timeRanges: timeRangeData, topCountries });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch transparency data: ${JSON.stringify(error)}`);
		}
	}

	private async getTotals(): Promise<TransparencyTotals> {
		const result = await this.db.$queryRaw<
			{ total_chf: number; contributor_count: number; contribution_count: number }[]
		>`
			SELECT
				COALESCE(SUM(amount_chf), 0)::float as total_chf,
				COUNT(DISTINCT contributor_id)::int as contributor_count,
				COUNT(*)::int as contribution_count
			FROM contribution
			WHERE status = 'succeeded'
		`;

		return {
			totalContributionsChf: result[0]?.total_chf ?? 0,
			totalContributors: result[0]?.contributor_count ?? 0,
			totalContributionsCount: result[0]?.contribution_count ?? 0,
		};
	}

	private async getContributionsByTimeRanges(ranges: TimeRange[]): Promise<ContributionTimeRange[]> {
		return await Promise.all(
			ranges.map(async (range) => {
				const result = await this.db.$queryRaw<{ total_chf: number }[]>`
					SELECT COALESCE(SUM(amount_chf), 0)::float as total_chf
					FROM contribution
					WHERE status = 'succeeded'
						AND created_at >= ${range.start.toJSDate()}
						AND created_at < ${range.end.toJSDate()}
				`;
				return {
					start: range.start,
					end: range.end,
					totalChf: result[0]?.total_chf ?? 0,
				};
			}),
		);
	}

	private async getContributionsByCountry(limit: number): Promise<ContributionsByCountry[]> {
		const result = await this.db.$queryRaw<{ country: CountryCode; total_chf: number; contributor_count: number }[]>`
			SELECT
				a.country,
				COALESCE(SUM(c.amount_chf), 0)::float as total_chf,
				COUNT(DISTINCT c.contributor_id)::int as contributor_count
			FROM contribution c
			JOIN contributor cr ON c.contributor_id = cr.id
			JOIN contact ct ON cr.contact_id = ct.id
			JOIN address a ON ct.address_id = a.id
			WHERE c.status = 'succeeded'
				AND a.country IS NOT NULL
			GROUP BY a.country
			ORDER BY total_chf DESC
			LIMIT ${limit}
		`;

		const grandTotal = result.reduce((sum, r) => sum + r.total_chf, 0);

		return result.map((r) => ({
			country: getCountryNameByCode(r.country),
			countryCode: r.country,
			totalChf: r.total_chf,
			contributorCount: r.contributor_count,
			percentageOfTotal: grandTotal > 0 ? (r.total_chf / grandTotal) * 100 : 0,
		}));
	}
}
