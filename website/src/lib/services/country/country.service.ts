import { getCountryNameByCode } from '@/lib/types/country';
import { CountryCode, NetworkTechnology, PaymentProvider, SanctionRegime } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserService } from '../user/user.service';
import {
	CountryCondition,
	CountryCreateInput,
	CountryPayload,
	CountryTableView,
	CountryTableViewRow,
	CountryUpdateInput,
	ProgramCountryFeasibilityRow,
	ProgramCountryFeasibilityView,
} from './country.types';

export class CountryService extends BaseService {
	private userService = new UserService();

	async create(userId: string, input: CountryCreateInput): Promise<ServiceResult<CountryPayload>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const created = await this.db.country.create({
				data: {
					isoCode: input.isoCode,
					isActive: input.isActive,
					microfinanceIndex: input.microfinanceIndex ?? undefined,
					populationCoverage: input.populationCoverage ?? undefined,
					latestSurveyDate: input.latestSurveyDate ?? undefined,
					networkTechnology: input.networkTechnology ? (input.networkTechnology as NetworkTechnology) : undefined,
					paymentProviders: input.paymentProviders ? (input.paymentProviders as PaymentProvider[]) : undefined,
					sanctions: input.sanctions ? (input.sanctions as SanctionRegime[]) : undefined,
					microfinanceSourceLink: input.microfinanceSourceLink
						? { create: { text: input.microfinanceSourceLink.text, href: input.microfinanceSourceLink.href } }
						: undefined,
					networkSourceLink: input.networkSourceLink
						? { create: { text: input.networkSourceLink.text, href: input.networkSourceLink.href } }
						: undefined,
				},
				include: { microfinanceSourceLink: true, networkSourceLink: true },
			});

			return this.resultOk({
				id: created.id,
				isoCode: created.isoCode,
				isActive: created.isActive,
				microfinanceIndex: created.microfinanceIndex ? Number(created.microfinanceIndex) : null,
				populationCoverage: created.populationCoverage ? Number(created.populationCoverage) : null,
				latestSurveyDate: created.latestSurveyDate ?? null,
				networkTechnology: created.networkTechnology ?? null,
				paymentProviders: created.paymentProviders ?? [],
				sanctions: created.sanctions ?? [],
				microfinanceSourceLink: created.microfinanceSourceLink
					? {
							id: created.microfinanceSourceLink.id,
							text: created.microfinanceSourceLink.text,
							href: created.microfinanceSourceLink.href,
						}
					: null,
				networkSourceLink: created.networkSourceLink
					? {
							id: created.networkSourceLink.id,
							text: created.networkSourceLink.text,
							href: created.networkSourceLink.href,
						}
					: null,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not create country: ${JSON.stringify(error)}`);
		}
	}

	async update(userId: string, input: CountryUpdateInput): Promise<ServiceResult<CountryPayload>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const updated = await this.db.country.update({
				where: { id: input.id },
				data: {
					isoCode: input.isoCode,
					isActive: input.isActive,
					microfinanceIndex: input.microfinanceIndex,
					populationCoverage: input.populationCoverage,
					latestSurveyDate: input.latestSurveyDate,
					networkTechnology: input.networkTechnology ? (input.networkTechnology as NetworkTechnology) : undefined,
					paymentProviders: input.paymentProviders ? (input.paymentProviders as PaymentProvider[]) : undefined,
					sanctions: input.sanctions ? (input.sanctions as SanctionRegime[]) : undefined,
					microfinanceSourceLink: input.microfinanceSourceLink
						? {
								upsert: {
									create: { text: input.microfinanceSourceLink.text, href: input.microfinanceSourceLink.href },
									update: { text: input.microfinanceSourceLink.text, href: input.microfinanceSourceLink.href },
								},
							}
						: undefined,
					networkSourceLink: input.networkSourceLink
						? {
								upsert: {
									create: { text: input.networkSourceLink.text, href: input.networkSourceLink.href },
									update: { text: input.networkSourceLink.text, href: input.networkSourceLink.href },
								},
							}
						: undefined,
				},
				include: { microfinanceSourceLink: true, networkSourceLink: true },
			});

			return this.resultOk({
				id: updated.id,
				isoCode: updated.isoCode,
				isActive: updated.isActive,
				microfinanceIndex: updated.microfinanceIndex ? Number(updated.microfinanceIndex) : null,
				populationCoverage: updated.populationCoverage ? Number(updated.populationCoverage) : null,
				latestSurveyDate: updated.latestSurveyDate ?? null,
				networkTechnology: updated.networkTechnology ?? null,
				paymentProviders: updated.paymentProviders ?? [],
				sanctions: updated.sanctions ?? [],
				microfinanceSourceLink: updated.microfinanceSourceLink
					? {
							id: updated.microfinanceSourceLink.id,
							text: updated.microfinanceSourceLink.text,
							href: updated.microfinanceSourceLink.href,
						}
					: null,
				networkSourceLink: updated.networkSourceLink
					? {
							id: updated.networkSourceLink.id,
							text: updated.networkSourceLink.text,
							href: updated.networkSourceLink.href,
						}
					: null,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not update country: ${JSON.stringify(error)}`);
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
				include: { microfinanceSourceLink: true, networkSourceLink: true },
			});

			if (!country) {
				return this.resultFail('Could not get country');
			}

			return this.resultOk({
				id: country.id,
				isoCode: country.isoCode,
				isActive: country.isActive,
				microfinanceIndex: country.microfinanceIndex ? Number(country.microfinanceIndex) : null,
				populationCoverage: country.populationCoverage ? Number(country.populationCoverage) : null,
				latestSurveyDate: country.latestSurveyDate ?? null,
				networkTechnology: country.networkTechnology ?? null,
				paymentProviders: country.paymentProviders ?? [],
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
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const countries = await this.db.country.findMany({
				select: {
					id: true,
					isoCode: true,
					isActive: true,
					microfinanceIndex: true,
					populationCoverage: true,
					networkTechnology: true,
					latestSurveyDate: true,
					paymentProviders: true,
					sanctions: true,
					createdAt: true,
				},
				orderBy: [{ isoCode: 'asc' }],
			});

			const tableRows: CountryTableViewRow[] = countries.map((c) => ({
				id: c.id,
				isoCode: c.isoCode,
				isActive: c.isActive,
				microfinanceIndex: c.microfinanceIndex ? Number(c.microfinanceIndex) : null,
				populationCoverage: c.populationCoverage ? Number(c.populationCoverage) : null,
				networkTechnology: c.networkTechnology ?? null,
				latestSurveyDate: c.latestSurveyDate ?? null,
				paymentProviders: c.paymentProviders ?? [],
				sanctions: c.sanctions ?? [],
				createdAt: c.createdAt,
			}));

			return this.resultOk({ tableRows });
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
					},

					stats: {
						programCount,
						recipientCount,
					},

					cash: {
						condition: this.getCashCondition(microfinanceIndex),
						details: {
							text: this.getCashDetailsText(country.isoCode, microfinanceIndex),
							source: country.microfinanceSourceLink
								? {
										text: country.microfinanceSourceLink.text,
										href: country.microfinanceSourceLink.href,
									}
								: undefined,
						},
					},

					mobileMoney: {
						condition: this.getMobileMoneyCondition(country.paymentProviders),
						details: {
							text: this.getMobileMoneyDetailsText(country.isoCode, country.paymentProviders),
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

	private getCashCondition(microfinanceIndex: number | null): CountryCondition {
		if (microfinanceIndex === null) return CountryCondition.NOT_MET;
		return microfinanceIndex < 3 ? CountryCondition.MET : CountryCondition.NOT_MET;
	}

	private getMobileMoneyCondition(paymentProviders: PaymentProvider[] | null): CountryCondition {
		return paymentProviders && paymentProviders.length > 0 ? CountryCondition.MET : CountryCondition.NOT_MET;
	}

	private getMobileNetworkCondition(populationCoverage: number | null): CountryCondition {
		if (populationCoverage === null) return CountryCondition.NOT_MET;
		return populationCoverage >= 50 ? CountryCondition.MET : CountryCondition.NOT_MET;
	}

	private getSanctionsCondition(sanctions: SanctionRegime[] | null): CountryCondition {
		return sanctions && sanctions.length > 0 ? CountryCondition.RESTRICTIONS_APPLY : CountryCondition.MET;
	}

	private getCashDetailsText(countryIsoCode: CountryCode, microfinanceIndex: number | null): string {
		if (microfinanceIndex === null) {
			return `Market functionality in ${getCountryNameByCode(countryIsoCode)} may be impaired.`;
		}

		return microfinanceIndex < 3
			? `Market functionality in ${getCountryNameByCode(countryIsoCode)} is considered sufficient.`
			: `Market functionality in ${getCountryNameByCode(countryIsoCode)} may be impaired.`;
	}

	private getMobileMoneyDetailsText(countryIsoCode: CountryCode, paymentProviders: PaymentProvider[] | null): string {
		if (!paymentProviders || paymentProviders.length === 0) {
			return `Mobile money infrastructure in ${getCountryNameByCode(countryIsoCode)} is not sufficient.`;
		}

		const providers = paymentProviders.map(this.formatEnum).join(', ');

		return `Mobile money infrastructure in ${getCountryNameByCode(countryIsoCode)} is considered sufficient. Following ${
			paymentProviders.length
		} provider${paymentProviders.length > 1 ? 's are' : ' is'} active: ${providers}.`;
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

	private toNumber(value: Decimal | null): number | null {
		return value === null ? null : Number(value);
	}

	private formatEnum(value: string): string {
		return value
			.replace(/_/g, ' ')
			.toLowerCase()
			.replace(/^\w/, (c) => c.toUpperCase());
	}
}
