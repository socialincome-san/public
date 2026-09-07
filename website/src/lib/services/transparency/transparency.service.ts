import { type PrismaClient } from '@/generated/prisma/client';
import { PayoutStatus, type CountryCode } from '@/generated/prisma/enums';
import { isValidCountryCode } from '@/lib/types/country';
import { getCountryFlagColors } from '@/lib/utils/country-flag-colors';
import { startOfMonth, subMonths } from 'date-fns';
import { BaseService } from '../core/base.service';
import type { ServiceResult } from '../core/base.types';
import { type ReserveReadService } from '../reserves/reserve-read.service';
import {
	buildTransparencyCountriesData,
	compareCountryContributionRows,
	TOP_CONTRIBUTING_COUNTRIES_LIMIT,
} from './countries-distribution';
import type {
	CountryContributionRow,
	CountryTransparencyTotals,
	TransparencyCountriesData,
	TransparencyFinancialPeriod,
	TransparencySummaryData,
} from './transparency.types';
import { getTransparencyFinancialPeriodDateFilter } from './transparency.types';

export class TransparencyService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly reserveReadService: ReserveReadService,
	) {
		super(db);
	}

	async getTotalContributionsChf(
		financialPeriod: TransparencyFinancialPeriod = { kind: 'all-time' },
	): Promise<ServiceResult<number>> {
		try {
			const totalContributionsChf = await this.queryTotalContributionsChf(financialPeriod);

			return this.resultOk(totalContributionsChf);
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not fetch total contributions: ${JSON.stringify(error)}`);
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

	async getTransparencySummary(
		financialPeriod: TransparencyFinancialPeriod = { kind: 'all-time' },
	): Promise<ServiceResult<TransparencySummaryData>> {
		try {
			const [inflowsChf, outflowsChf, latestReservesResult] = await Promise.all([
				this.queryTotalContributionsChf(financialPeriod),
				this.getOutflows(financialPeriod),
				this.reserveReadService.getLatestPerBankAccount(),
			]);
			if (!latestReservesResult.success) {
				return this.resultFail(latestReservesResult.error);
			}

			return this.resultOk({
				financialSummary: {
					inflowsChf,
					outflowsChf,
					reservesChf: latestReservesResult.data.total,
				},
				reserveAccounts: latestReservesResult.data.accounts,
			});
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not fetch transparency summary: ${JSON.stringify(error)}`);
		}
	}

	async getRunwayMonths(): Promise<ServiceResult<number>> {
		try {
			const latestReservesResult = await this.reserveReadService.getLatestPerBankAccount();
			if (!latestReservesResult.success) {
				return this.resultFail(latestReservesResult.error);
			}

			const monthlyRecipientPaymentsChf = await this.getLastCompletedMonthRecipientPaymentsChf(
				this.getLatestReserveRecordedAt(latestReservesResult.data.accounts) ?? new Date(),
			);
			if (monthlyRecipientPaymentsChf <= 0) {
				return this.resultFail('No recipient payments in the last completed month');
			}

			return this.resultOk(Math.floor(latestReservesResult.data.total / monthlyRecipientPaymentsChf));
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not calculate runway months: ${JSON.stringify(error)}`);
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

	private async queryTotalContributionsChf(financialPeriod: TransparencyFinancialPeriod): Promise<number> {
		const createdAt = getTransparencyFinancialPeriodDateFilter(financialPeriod);
		const aggregate = await this.db.contribution.aggregate({
			where: { status: 'succeeded', createdAt },
			_sum: { amountChf: true },
		});

		return Number(aggregate._sum.amountChf ?? 0);
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

	private getLatestReserveRecordedAt(accounts: { recordedAt: Date | null }[]): Date | undefined {
		return accounts.reduce<Date | undefined>((latest, { recordedAt }) => {
			if (!recordedAt) {
				return latest;
			}

			return latest && latest > recordedAt ? latest : recordedAt;
		}, undefined);
	}

	private async getLastCompletedMonthRecipientPaymentsChf(referenceDate: Date): Promise<number> {
		const aggregate = await this.db.payout.aggregate({
			where: {
				status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] },
				paymentAt: {
					gte: startOfMonth(subMonths(referenceDate, 1)),
					lt: startOfMonth(referenceDate),
				},
			},
			_sum: { amountChf: true },
		});

		return Number(aggregate._sum.amountChf ?? 0);
	}
}
