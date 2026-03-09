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
	ProgramCountryFeasibilityRow,
	ProgramCountryFeasibilityView,
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
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
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
		const paginated = await this.getPaginatedTableView(userId, {
			page: 1,
			pageSize: 10_000,
			search: '',
		});
		if (!paginated.success) {
			return this.resultFail(paginated.error);
		}
		return this.resultOk({ tableRows: paginated.data.tableRows });
	}

	async getPaginatedTableView(
		userId: string,
		query: CountryTableQuery,
	): Promise<ServiceResult<CountryPaginatedTableView>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
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
				networkTechnology: c.networkTechnology ?? null,
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
				const mobileMoneyCondition = this.getMobileMoneyCondition(
					country.mobileMoneyProviders,
					mobileMoneyIsOverridden,
				);

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
							text: this.getCashDetailsText(country.isoCode, microfinanceIndex, cashCondition),
							source: country.microfinanceSourceLink
								? {
										text: country.microfinanceSourceLink.text,
										href: country.microfinanceSourceLink.href,
									}
								: cashIsOverridden
									? { text: 'Source: SI Research' }
									: undefined,
						},
					},
					mobileMoney: {
						condition: mobileMoneyCondition,
						details: {
							text: this.getMobileMoneyDetailsText(country.isoCode, country.mobileMoneyProviders, mobileMoneyCondition),
							source: {
								text: 'Source: SI Research',
							},
						},
					},
					mobileNetwork: {
						condition: this.getMobileNetworkCondition(populationCoverage),
						details: {
							text: this.getMobileNetworkDetailsText(country.isoCode, populationCoverage),
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
							text: this.getSanctionsDetailsText(country.isoCode, country.sanctions),
							source:
								country.sanctions && country.sanctions.length > 0
									? { text: 'Source: EU Sanctions Map & US Sanctions List' }
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

	private getCashCondition(microfinanceIndex: number | null, overwriteCondition: boolean): CountryCondition {
		if (overwriteCondition) {
			return CountryCondition.MET;
		}

		if (microfinanceIndex === null) {
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

	private getSanctionsCondition(sanctions: SanctionRegime[] | null): CountryCondition {
		return sanctions && sanctions.length > 0 ? CountryCondition.RESTRICTIONS_APPLY : CountryCondition.MET;
	}

	private getCashDetailsText(
		countryIsoCode: CountryCode,
		microfinanceIndex: number | null,
		condition: CountryCondition,
	): string {
		if (condition === CountryCondition.MET) {
			return microfinanceIndex === null
				? `Market functionality in ${getCountryNameByCode(countryIsoCode)} appears intact.`
				: `Market functionality in ${getCountryNameByCode(countryIsoCode)} appears intact (MFI ${microfinanceIndex}).`;
		}

		return microfinanceIndex === null
			? `Market functionality in ${getCountryNameByCode(countryIsoCode)} may be impaired.`
			: `Market functionality in ${getCountryNameByCode(countryIsoCode)} may be impaired (MFI ${microfinanceIndex}).`;
	}

	private getMobileMoneyDetailsText(
		countryIsoCode: CountryCode,
		mobileMoneyProviders: MobileMoneyProviderRef[] | null,
		condition: CountryCondition,
	): string {
		if (condition !== CountryCondition.MET) {
			return `Mobile money infrastructure in ${getCountryNameByCode(countryIsoCode)} is not sufficient.`;
		}

		if (!mobileMoneyProviders || mobileMoneyProviders.length === 0) {
			return `Mobile money infrastructure in ${getCountryNameByCode(countryIsoCode)} is considered sufficient.`;
		}

		const providers = mobileMoneyProviders.map((p) => p.name).join(', ');

		return `Mobile money infrastructure in ${getCountryNameByCode(countryIsoCode)} is considered sufficient. Following ${
			mobileMoneyProviders.length
		} provider${mobileMoneyProviders.length > 1 ? 's are' : ' is'} active: ${providers}.`;
	}

	private getMobileNetworkDetailsText(countryIsoCode: CountryCode, populationCoverage: number | null): string {
		if (populationCoverage === null) {
			return `No reliable mobile network coverage data available for ${getCountryNameByCode(countryIsoCode)}.`;
		}

		return populationCoverage >= 50
			? `Mobile network coverage of ${getCountryNameByCode(countryIsoCode)} is considered sufficient. ${populationCoverage}% of the population is covered by the mobile network.`
			: `Mobile network coverage of ${getCountryNameByCode(countryIsoCode)} is considered insufficient. Only ${populationCoverage}% of the population is covered.`;
	}

	private getSanctionsDetailsText(countryIsoCode: CountryCode, sanctions: SanctionRegime[] | null): string {
		return sanctions && sanctions.length > 0
			? `${getCountryNameByCode(countryIsoCode)} is subject to international sanctions or restrictions.`
			: `${getCountryNameByCode(countryIsoCode)} is not on the UN, US or EU sanctioned list.`;
	}

	private toNumber(value: Prisma.Decimal | null): number | null {
		return value === null ? null : Number(value);
	}
}
