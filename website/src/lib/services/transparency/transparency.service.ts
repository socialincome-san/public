import { CountryCode } from '@/generated/prisma/enums';
import { getCountryNameByCode } from '@/lib/types/country';
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
		const [aggregate, distinctContributors] = await Promise.all([
			this.db.contribution.aggregate({
				where: { status: 'succeeded' },
				_sum: { amountChf: true },
				_count: { _all: true },
			}),
			this.db.contribution.findMany({
				where: { status: 'succeeded' },
				distinct: ['contributorId'],
				select: { contributorId: true },
			}),
		]);

		return {
			totalContributionsChf: Number(aggregate._sum.amountChf ?? 0),
			totalContributors: distinctContributors.length,
			totalContributionsCount: aggregate._count._all,
		};
	}

	private async getContributionsByTimeRanges(ranges: TimeRange[]): Promise<ContributionTimeRange[]> {
		return await Promise.all(
			ranges.map(async (range) => {
				const aggregate = await this.db.contribution.aggregate({
					where: {
						status: 'succeeded',
						createdAt: {
							gte: range.start.toJSDate(),
							lt: range.end.toJSDate(),
						},
					},
					_sum: { amountChf: true },
				});
				return {
					start: range.start,
					end: range.end,
					totalChf: Number(aggregate._sum.amountChf ?? 0),
				};
			}),
		);
	}

	private async getContributionsByCountry(limit: number): Promise<ContributionsByCountry[]> {
		const contributions = await this.db.contribution.findMany({
			where: {
				status: 'succeeded',
				contributor: {
					contact: {
						address: { isNot: null },
					},
				},
			},
			select: {
				amountChf: true,
				contributorId: true,
				contributor: {
					select: {
						contact: {
							select: {
								address: {
									select: { country: true },
								},
							},
						},
					},
				},
			},
		});

		const countryMap = new Map<CountryCode, { totalChf: number; contributors: Set<string> }>();
		for (const c of contributions) {
			const country = c.contributor.contact.address?.country;
			if (!country) continue;

			let entry = countryMap.get(country);
			if (!entry) {
				entry = { totalChf: 0, contributors: new Set() };
				countryMap.set(country, entry);
			}
			entry.totalChf += Number(c.amountChf);
			entry.contributors.add(c.contributorId);
		}

		const allCountries = [...countryMap.entries()]
			.map(([countryCode, data]) => ({
				countryCode,
				totalChf: data.totalChf,
				contributorCount: data.contributors.size,
			}))
			.sort((a, b) => b.totalChf - a.totalChf);

		const grandTotal = allCountries.reduce((sum, r) => sum + r.totalChf, 0);

		return allCountries.slice(0, limit).map((r) => ({
			country: getCountryNameByCode(r.countryCode),
			countryCode: r.countryCode,
			totalChf: r.totalChf,
			contributorCount: r.contributorCount,
			percentageOfTotal: grandTotal > 0 ? (r.totalChf / grandTotal) * 100 : 0,
		}));
	}
}
