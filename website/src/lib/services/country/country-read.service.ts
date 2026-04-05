import { CountryCode, NetworkTechnology, Prisma, PrismaClient, SanctionRegime } from '@/generated/prisma/client';
import { getCountryNameByCode } from '@/lib/types/country';
import { logger } from '@/lib/utils/logger';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import {
	CountryCondition,
	CountryPaginatedTableView,
	CountryPayload,
	CountryTableQuery,
	CountryTableView,
	CountryTableViewRow,
	MobileMoneyProviderRef,
	NETWORK_TECH_LABELS,
	ProgramCountryFeasibilityRow,
	ProgramCountryFeasibilityView,
	PublicCountryStats,
	PublicCountryStatsMap,
} from './country.types';

export class CountryReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private buildCountryOrderBy(query: CountryTableQuery): Prisma.CountryOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, [
			'id',
			'isoCode',
			'isActive',
			'microfinanceIndex',
			'populationCoverage',
			'networkTechnology',
			'latestSurveyDate',
			'updatedAt',
		] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'isoCode':
				return [{ isoCode: direction }];
			case 'isActive':
				return [{ isActive: direction }];
			case 'microfinanceIndex':
				return [{ microfinanceIndex: direction }];
			case 'populationCoverage':
				return [{ populationCoverage: direction }];
			case 'networkTechnology':
				return [{ networkTechnology: direction }];
			case 'latestSurveyDate':
				return [{ latestSurveyDate: direction }];
			case 'updatedAt':
				return [{ updatedAt: direction }];
			default:
				return [{ isoCode: 'asc' }];
		}
	}

	async get(userId: string, countryId: string): Promise<ServiceResult<CountryPayload>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const country = await this.db.country.findUnique({
				where: { id: countryId },
				include: {
					microfinanceSourceLink: true,
					networkSourceLink: true,
					mobileMoneyProviders: { select: { id: true, name: true } },
				},
			});

			if (!country) {
				return this.resultFail('Could not get country');
			}

			return this.resultOk({
				id: country.id,
				isoCode: country.isoCode,
				isActive: country.isActive,
				currency: country.currency,
				defaultPayoutAmount: Number(country.defaultPayoutAmount),
				microfinanceIndex: country.microfinanceIndex ? Number(country.microfinanceIndex) : null,
				cashConditionOverride: country.cashConditionOverride ?? false,
				populationCoverage: country.populationCoverage ? Number(country.populationCoverage) : null,
				latestSurveyDate: country.latestSurveyDate ?? null,
				networkTechnology: country.networkTechnology ?? null,
				mobileMoneyProviders: country.mobileMoneyProviders ?? [],
				mobileMoneyConditionOverride: country.mobileMoneyConditionOverride ?? false,
				sanctions: country.sanctions ?? [],
				microfinanceSourceLink: country.microfinanceSourceLink
					? {
							id: country.microfinanceSourceLink.id,
							text: country.microfinanceSourceLink.text,
							href: country.microfinanceSourceLink.href,
						}
					: null,
				networkSourceLink: country.networkSourceLink
					? {
							id: country.networkSourceLink.id,
							text: country.networkSourceLink.text,
							href: country.networkSourceLink.href,
						}
					: null,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not get country: ${JSON.stringify(error)}`);
		}
	}

	async getTableView(userId: string): Promise<ServiceResult<CountryTableView>> {
		try {
			const paginated = await this.getPaginatedTableView(userId, {
				page: 1,
				pageSize: 10_000,
				search: '',
			});
			if (!paginated.success) {
				return this.resultFail(paginated.error);
			}

			return this.resultOk({ tableRows: paginated.data.tableRows });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch country table view: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableView(userId: string, query: CountryTableQuery): Promise<ServiceResult<CountryPaginatedTableView>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const search = query.search.trim();
			const matchedIsoCode = Object.values(CountryCode).find((code) => code.toLowerCase() === search.toLowerCase());
			const matchedNetworkTechnology = Object.values(NetworkTechnology).find(
				(technology) => technology.toLowerCase() === search.toLowerCase(),
			);
			const where = search
				? {
						OR: [
							{ id: { contains: search, mode: 'insensitive' as const } },
							...(matchedIsoCode ? [{ isoCode: { equals: matchedIsoCode } }] : []),
							...(matchedNetworkTechnology ? [{ networkTechnology: { equals: matchedNetworkTechnology } }] : []),
						],
					}
				: undefined;
			const [countries, totalCount] = await Promise.all([
				this.db.country.findMany({
					where,
					select: {
						id: true,
						isoCode: true,
						isActive: true,
						microfinanceIndex: true,
						populationCoverage: true,
						networkTechnology: true,
						latestSurveyDate: true,
						mobileMoneyProviders: { select: { id: true, name: true } },
						sanctions: true,
						createdAt: true,
						updatedAt: true,
					},
					orderBy: this.buildCountryOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.country.count({ where }),
			]);

			const tableRows: CountryTableViewRow[] = countries.map((c) => ({
				id: c.id,
				isoCode: c.isoCode,
				isActive: c.isActive,
				microfinanceIndex: c.microfinanceIndex ? Number(c.microfinanceIndex) : null,
				populationCoverage: c.populationCoverage ? Number(c.populationCoverage) : null,
				networkTechnology: c.networkTechnology ? NETWORK_TECH_LABELS[c.networkTechnology] : null,
				latestSurveyDate: c.latestSurveyDate ?? null,
				mobileMoneyProviders: c.mobileMoneyProviders ?? [],
				sanctions: c.sanctions ?? [],
				updatedAt: c.updatedAt ?? c.createdAt,
			}));

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch countries: ${JSON.stringify(error)}`);
		}
	}

	async getProgramCountryFeasibility(): Promise<ServiceResult<ProgramCountryFeasibilityView>> {
		try {
			const countries = await this.db.country.findMany({
				include: {
					microfinanceSourceLink: true,
					networkSourceLink: true,
					mobileMoneyProviders: { select: { id: true, name: true } },
					programs: {
						include: {
							_count: {
								select: { recipients: true },
							},
						},
					},
					_count: {
						select: { programs: true },
					},
				},
				orderBy: { isoCode: 'asc' },
			});

			const rows: ProgramCountryFeasibilityRow[] = countries.map((country) => {
				const microfinanceIndex = this.toNumber(country.microfinanceIndex);
				const populationCoverage = this.toNumber(country.populationCoverage);
				const cashIsOverridden = country.cashConditionOverride ?? false;
				const mobileMoneyIsOverridden = country.mobileMoneyConditionOverride ?? false;
				const cashCondition = this.getCashCondition(microfinanceIndex, cashIsOverridden);
				const mobileMoneyCondition = this.getMobileMoneyCondition(country.mobileMoneyProviders, mobileMoneyIsOverridden);
				const mobileMoneyProviders = country.mobileMoneyProviders ?? [];
				const mobileMoneyProviderCount = mobileMoneyProviders.length;
				const mobileMoneyProviderNames = mobileMoneyProviders.map((provider) => provider.name).join(', ');
				const mobileNetworkCondition = this.getMobileNetworkCondition(populationCoverage);
				const networkTechnologyLabel = this.getNetworkTechnologyLabel(country.networkTechnology);
				const countryName = getCountryNameByCode(country.isoCode);
				const mobileNetworkTranslationKey =
					mobileNetworkCondition === CountryCondition.MET
						? networkTechnologyLabel
							? 'step1.details.mobile_network.met_with_tech'
							: 'step1.details.mobile_network.met'
						: populationCoverage === null
							? 'step1.details.mobile_network.not_met_unknown'
							: 'step1.details.mobile_network.not_met';
				let mobileNetworkTranslationContext: Record<string, string | number> | undefined;
				if (mobileNetworkCondition === CountryCondition.MET) {
					mobileNetworkTranslationContext = { populationCoverage: populationCoverage ?? 0 };
					if (networkTechnologyLabel) {
						mobileNetworkTranslationContext.tech = networkTechnologyLabel;
					}
				} else if (populationCoverage !== null) {
					mobileNetworkTranslationContext = { populationCoverage };
				}

				const programCount = country._count.programs;

				let recipientCount = 0;
				for (const program of country.programs) {
					recipientCount += program._count.recipients;
				}

				return {
					id: country.id,
					country: {
						isoCode: country.isoCode,
						isActive: country.isActive,
						currency: country.currency,
						defaultPayoutAmount: Number(country.defaultPayoutAmount),
					},
					stats: {
						programCount,
						recipientCount,
					},
					cash: {
						condition: cashCondition,
						details: {
							translationKey:
								cashCondition === CountryCondition.MET ? 'step1.details.cash.met' : 'step1.details.cash.not_met',
							translationContext: { country: countryName },
							source: country.microfinanceSourceLink
								? {
										text: country.microfinanceSourceLink.text,
										href: country.microfinanceSourceLink.href,
									}
								: cashIsOverridden
									? { translationKey: 'step1.source.si_research' }
									: undefined,
						},
					},
					mobileMoney: {
						condition: mobileMoneyCondition,
						details: {
							translationKey:
								mobileMoneyCondition === CountryCondition.MET
									? 'step1.details.mobile_money.met'
									: 'step1.details.mobile_money.not_met',
							translationContext:
								mobileMoneyCondition === CountryCondition.MET
									? {
											providerCount: mobileMoneyProviderCount,
											providerLabel: mobileMoneyProviderCount > 1 ? 'providers' : 'provider',
											providers: mobileMoneyProviderNames,
										}
									: undefined,
							source: {
								translationKey: 'step1.source.si_research',
							},
						},
					},
					mobileNetwork: {
						condition: mobileNetworkCondition,
						details: {
							translationKey: mobileNetworkTranslationKey,
							translationContext: mobileNetworkTranslationContext,
							source: country.networkSourceLink
								? {
										text: country.networkSourceLink.text,
										href: country.networkSourceLink.href,
									}
								: undefined,
						},
					},
					sanctions: {
						condition: this.getSanctionsCondition(country.sanctions),
						details: {
							translationKey:
								this.getSanctionsCondition(country.sanctions) === CountryCondition.RESTRICTIONS_APPLY
									? 'step1.details.sanctions.restrictions_apply'
									: 'step1.details.sanctions.met',
							translationContext: { country: countryName },
							source:
								country.sanctions && country.sanctions.length > 0
									? { translationKey: 'step1.source.sanctions_lists' }
									: undefined,
						},
					},
				};
			});

			return this.resultOk({ rows });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch program country feasibility: ${JSON.stringify(error)}`);
		}
	}

	async getPublicCountryStatsByIsoCode(
		isoCode: string,
	): Promise<ServiceResult<{ programsCount: number; recipientsCount: number }>> {
		try {
			const normalizedIsoCode = isoCode.trim().toUpperCase();
			if (!normalizedIsoCode) {
				return this.resultFail('Missing isoCode');
			}

			const statsByIsoCodesResult = await this.getPublicCountryStatsByIsoCodes([normalizedIsoCode]);
			if (!statsByIsoCodesResult.success) {
				return this.resultFail(statsByIsoCodesResult.error);
			}

			const countryStats = statsByIsoCodesResult.data[normalizedIsoCode];
			if (!countryStats) {
				return this.resultFail('Country not found');
			}

			return this.resultOk(countryStats);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not load country stats: ${JSON.stringify(error)}`);
		}
	}

	async getPublicCountryStatsByIsoCodes(isoCodes: string[]): Promise<ServiceResult<PublicCountryStatsMap>> {
		try {
			const normalizedIsoCodes = [...new Set(isoCodes.map((isoCode) => isoCode.trim().toUpperCase()).filter(Boolean))];
			if (!normalizedIsoCodes.length) {
				return this.resultOk({});
			}

			const countries = await this.db.country.findMany({
				where: { isoCode: { in: normalizedIsoCodes as CountryCode[] } },
				select: {
					isoCode: true,
					_count: { select: { programs: true } },
					programs: {
						select: {
							_count: { select: { recipients: true } },
						},
					},
				},
			});

			const statsByIsoCode: PublicCountryStatsMap = {};
			for (const country of countries) {
				let recipientsCount = 0;
				for (const program of country.programs) {
					recipientsCount += program._count.recipients;
				}

				const stats: PublicCountryStats = {
					programsCount: country._count.programs,
					recipientsCount,
				};
				statsByIsoCode[country.isoCode] = stats;
			}

			return this.resultOk(statsByIsoCode);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not load country stats map: ${JSON.stringify(error)}`);
		}
	}

	private getCashCondition(microfinanceIndex: number | null, overwriteCondition: boolean): CountryCondition {
		if (overwriteCondition) {
			return CountryCondition.MET;
		}

		if (microfinanceIndex === null || microfinanceIndex === 0) {
			return CountryCondition.NOT_MET;
		}

		return microfinanceIndex >= 3.5 ? CountryCondition.MET : CountryCondition.NOT_MET;
	}

	private getMobileMoneyCondition(
		mobileMoneyProviders: MobileMoneyProviderRef[] | null,
		overwriteCondition: boolean,
	): CountryCondition {
		if (overwriteCondition) {
			return CountryCondition.MET;
		}

		return mobileMoneyProviders && mobileMoneyProviders.length > 0 ? CountryCondition.MET : CountryCondition.NOT_MET;
	}

	private getMobileNetworkCondition(populationCoverage: number | null): CountryCondition {
		if (populationCoverage === null) {
			return CountryCondition.NOT_MET;
		}

		return populationCoverage >= 50 ? CountryCondition.MET : CountryCondition.NOT_MET;
	}

	private getNetworkTechnologyLabel(networkTechnology: NetworkTechnology | null): string | undefined {
		if (!networkTechnology) {
			return undefined;
		}

		return NETWORK_TECH_LABELS[networkTechnology];
	}

	private getSanctionsCondition(sanctions: SanctionRegime[] | null): CountryCondition {
		return sanctions && sanctions.length > 0 ? CountryCondition.RESTRICTIONS_APPLY : CountryCondition.MET;
	}

	private toNumber(value: Prisma.Decimal | null): number | null {
		return value === null ? null : Number(value);
	}
}
