import { type PrismaClient } from '@/generated/prisma/client';
import { PayoutStatus, type CountryCode } from '@/generated/prisma/enums';
import { getCountryNameByCode, isValidCountryCode } from '@/lib/types/country';
import { getCountryFlagColors } from '@/lib/utils/country-flag-colors';
import { BaseService } from '../core/base.service';
import type { ServiceResult } from '../core/base.types';
import { type ReserveReadService } from '../reserves/reserve-read.service';
import {
	buildTransparencyCountriesData,
	compareCountryContributionRows,
	TOP_CONTRIBUTING_COUNTRIES_LIMIT,
} from './countries-distribution';
import type {
	ContributionsByCountry,
	ContributionTimeRange,
	CountryContributionRow,
	CountryTransparencyTotals,
	TimeRange,
	TransparencyCountriesData,
	TransparencyData,
	TransparencyFinancialPeriod,
	TransparencyTotals,
} from './transparency.types';
import { getTransparencyFinancialPeriodDateFilter } from './transparency.types';

export class TransparencyService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly reserveReadService: ReserveReadService,
	) {
		super(db);
	}

	async getTransparencyTotals(
		financialPeriod: TransparencyFinancialPeriod = { kind: 'all-time' },
	): Promise<ServiceResult<TransparencyTotals>> {
		try {
			const totals = await this.getTotals(financialPeriod);

			return this.resultOk(totals);
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not fetch transparency totals: ${JSON.stringify(error)}`);
		}
	}

	async getTransparencyTotalsForCountry(isoCode: string): Promise<ServiceResult<CountryTransparencyTotals>> {
		try {
			const normalizedIsoCode = isoCode.trim().toUpperCase();
			if (!normalizedIsoCode) {
				return this.resultFail('Missing isoCode');
			}

			if (!isValidCountryCode(normalizedIsoCode)) {
				return this.resultFail('Invalid country code');
			}

			const totals = await this.getTotalsForCountry(normalizedIsoCode);

			return this.resultOk(totals);
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not fetch transparency totals for country: ${JSON.stringify(error)}`);
		}
	}

	async getTransparencyData(
		timeRanges: TimeRange[],
		financialPeriod: TransparencyFinancialPeriod = { kind: 'all-time' },
	): Promise<ServiceResult<TransparencyData>> {
		try {
			const [totals, outflowsChf, latestReservesResult, timeRangeData, topCountries] = await Promise.all([
				this.getTotals(financialPeriod),
				this.getOutflows(financialPeriod),
				this.reserveReadService.getLatestPerBankAccount(),
				this.getContributionsByTimeRanges(timeRanges),
				this.getContributionsByCountry(TOP_CONTRIBUTING_COUNTRIES_LIMIT, financialPeriod),
			]);
			if (!latestReservesResult.success) {
				return this.resultFail(latestReservesResult.error);
			}

			return this.resultOk({
				totals,
				financialSummary: {
					inflowsChf: totals.totalContributionsChf,
					outflowsChf,
					reservesChf: latestReservesResult.data.total,
				},
				reserveAccounts: latestReservesResult.data.accounts,
				timeRanges: timeRangeData,
				topCountries,
			});
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not fetch transparency data: ${JSON.stringify(error)}`);
		}
	}

	async getContributionsByCountryData(
		limit: number = TOP_CONTRIBUTING_COUNTRIES_LIMIT,
		financialPeriod: TransparencyFinancialPeriod = { kind: 'all-time' },
	): Promise<ServiceResult<TransparencyCountriesData>> {
		try {
			const rows = await this.getCountryContributionRows(financialPeriod);

			return this.resultOk(
				buildTransparencyCountriesData(rows, {
					limit,
					getCountryColors: getCountryFlagColors,
				}),
			);
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not fetch contributions by country: ${JSON.stringify(error)}`);
		}
	}

	private async getTotals(financialPeriod: TransparencyFinancialPeriod): Promise<TransparencyTotals> {
		const createdAt = getTransparencyFinancialPeriodDateFilter(financialPeriod);
		const [aggregate, distinctContributors] = await Promise.all([
			this.db.contribution.aggregate({
				where: { status: 'succeeded', createdAt },
				_sum: { amountChf: true },
				_count: { _all: true },
			}),
			this.db.contribution.findMany({
				where: { status: 'succeeded', createdAt },
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

	private async getOutflows(financialPeriod: TransparencyFinancialPeriod): Promise<number> {
		const paymentAt = getTransparencyFinancialPeriodDateFilter(financialPeriod);
		const aggregate = await this.db.payout.aggregate({
			where: {
				status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] },
				paymentAt,
			},
			_sum: { amountChf: true },
		});

		return Number(aggregate._sum.amountChf ?? 0);
	}

	private async getTotalsForCountry(countryCode: CountryCode): Promise<CountryTransparencyTotals> {
		const aggregate = await this.db.contribution.aggregate({
			where: {
				status: 'succeeded',
				campaign: {
					program: {
						country: {
							isoCode: countryCode,
						},
					},
				},
			},
			_sum: { amountChf: true },
		});

		return {
			totalContributionsChf: Number(aggregate._sum.amountChf ?? 0),
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

	private async getContributionsByCountry(
		limit: number,
		financialPeriod: TransparencyFinancialPeriod,
	): Promise<ContributionsByCountry[]> {
		const allCountries = await this.getCountryContributionRows(financialPeriod);
		const grandTotal = allCountries.reduce((sum, row) => sum + row.totalChf, 0);

		return allCountries.slice(0, limit).map((row) => ({
			country: getCountryNameByCode(row.countryCode),
			countryCode: row.countryCode,
			totalChf: row.totalChf,
			contributorCount: row.contributorCount,
			percentageOfTotal: grandTotal > 0 ? (row.totalChf / grandTotal) * 100 : 0,
		}));
	}

	private async getCountryContributionRows(financialPeriod: TransparencyFinancialPeriod): Promise<CountryContributionRow[]> {
		const createdAt = getTransparencyFinancialPeriodDateFilter(financialPeriod);
		const contributions = await this.db.contribution.findMany({
			where: {
				status: 'succeeded',
				createdAt,
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
		for (const contribution of contributions) {
			const country = contribution.contributor.contact.address?.country;
			if (!country) {
				continue;
			}

			let entry = countryMap.get(country);
			if (!entry) {
				entry = { totalChf: 0, contributors: new Set() };
				countryMap.set(country, entry);
			}
			entry.totalChf += Number(contribution.amountChf);
			entry.contributors.add(contribution.contributorId);
		}

		return [...countryMap.entries()]
			.map(([countryCode, data]) => ({
				countryCode,
				totalChf: data.totalChf,
				contributorCount: data.contributors.size,
			}))
			.sort(compareCountryContributionRows);
	}
}
