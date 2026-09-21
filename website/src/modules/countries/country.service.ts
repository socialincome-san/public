import { CountryCode, type NetworkTechnology, type SanctionRegime } from '@/generated/prisma/enums';
import { fetchWorldBankIndicator } from '@/integrations/world-bank/world-bank.integration';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { getCountryNameByCode, isValidCountryCode } from '@/lib/types/country';
import { isAdmin } from '@/modules/users/user.service';
import * as countryRepository from './country.repository';
import type { CountryCreateInput, CountryUpdateInput } from './country.schemas';
import {
	CountryCondition,
	type CountryPaginatedTableView,
	type CountryPayload,
	type CountryStatisticRow,
	type CountryTableQuery,
	type CountryTableViewRow,
	type MobileMoneyProviderRef,
	NETWORK_TECH_LABELS,
	type ProgramCountryFeasibilityRow,
	type ProgramCountryFeasibilityView,
	type PublicCountryStats,
	type PublicCountryStatsMap,
} from './country.types';

const COUNTRY_STATISTIC_DEFINITIONS = [
	{
		key: 'population',
		indicator: 'SP.POP.TOTL',
		labelKey: 'countries-page.statistics.population',
		format: 'number',
	},
	{
		key: 'growthRate',
		indicator: 'SP.POP.GROW',
		labelKey: 'countries-page.statistics.growth-rate',
		format: 'percentage',
	},
	{
		key: 'literacyRate',
		indicator: 'SE.ADT.LITR.ZS',
		labelKey: 'countries-page.statistics.literacy-rate',
		format: 'percentage',
	},
	{
		key: 'povertyLevel',
		indicator: 'SI.POV.DDAY',
		labelKey: 'countries-page.statistics.poverty-level',
		format: 'percentage',
	},
	{
		key: 'lifeExpectancy',
		indicator: 'SP.DYN.LE00.IN',
		labelKey: 'countries-page.statistics.life-expectancy',
		format: 'years',
	},
] as const;

type CountryRecord = NonNullable<Awaited<ReturnType<typeof countryRepository.findCountryById>>>;
type CountryStatisticKey = (typeof COUNTRY_STATISTIC_DEFINITIONS)[number]['key'];
type CountryStatisticValueMap = Record<CountryStatisticKey, number | null>;

export const getCountry = async (userId: string, countryId: string): Promise<ServiceResult<CountryPayload>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const country = await countryRepository.findCountryById(countryId);
		if (!country) {
			return resultFail('Could not get country');
		}

		return resultOk(toCountryPayload(country));
	} catch (error) {
		console.error('Could not get country', { countryId, error });

		return resultFail('Could not get country');
	}
};

export const getPaginatedCountryTableView = async (
	userId: string,
	query: CountryTableQuery,
): Promise<ServiceResult<CountryPaginatedTableView>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const { countries, totalCount } = await countryRepository.findPaginatedCountries(query);
		const tableRows: CountryTableViewRow[] = countries.map((country) => ({
			id: country.id,
			isoCode: country.isoCode,
			isActive: country.isActive,
			microfinanceIndex: country.microfinanceIndex ? Number(country.microfinanceIndex) : null,
			populationCoverage: country.populationCoverage ? Number(country.populationCoverage) : null,
			networkTechnology: country.networkTechnology ? NETWORK_TECH_LABELS[country.networkTechnology] : null,
			latestSurveyDate: country.latestSurveyDate ?? null,
			mobileMoneyProviders: country.mobileMoneyProviders.map(({ mobileMoneyProvider }) => mobileMoneyProvider),
			sanctions: country.sanctions,
			updatedAt: country.updatedAt ?? country.createdAt,
		}));

		return resultOk({ tableRows, totalCount });
	} catch (error) {
		console.error('Could not fetch countries', { userId, error });

		return resultFail('Could not fetch countries');
	}
};

export const getProgramCountryFeasibility = async (): Promise<ServiceResult<ProgramCountryFeasibilityView>> => {
	try {
		const [countries, candidates] = await Promise.all([
			countryRepository.findCountriesForFeasibility(),
			countryRepository.findUnassignedRecipientCountries(),
		]);
		const candidateCountsByCountry = new Map<CountryCode, number>();
		for (const candidate of candidates) {
			const candidateCountry =
				candidate.contact?.address?.country ?? candidate.localPartner?.contact?.address?.country ?? null;
			if (candidateCountry) {
				candidateCountsByCountry.set(candidateCountry, (candidateCountsByCountry.get(candidateCountry) ?? 0) + 1);
			}
		}

		const rows: ProgramCountryFeasibilityRow[] = countries.map((country) => {
			const microfinanceIndex = country.microfinanceIndex === null ? null : Number(country.microfinanceIndex);
			const populationCoverage = country.populationCoverage === null ? null : Number(country.populationCoverage);
			const cashIsOverridden = country.cashConditionOverride ?? false;
			const mobileMoneyIsOverridden = country.mobileMoneyConditionOverride ?? false;
			const cashCondition = getCashCondition(microfinanceIndex, cashIsOverridden);
			const mobileMoneyProviders = country.mobileMoneyProviders.map(({ mobileMoneyProvider }) => mobileMoneyProvider);
			const mobileMoneyCondition = getMobileMoneyCondition(mobileMoneyProviders, mobileMoneyIsOverridden);
			const mobileMoneyProviderCount = mobileMoneyProviders.length;
			const mobileNetworkCondition = getMobileNetworkCondition(populationCoverage);
			const networkTechnologyLabel = getNetworkTechnologyLabel(country.networkTechnology);
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
				mobileNetworkTranslationContext = {
					populationCoverage: populationCoverage ?? 0,
				};
				if (networkTechnologyLabel) {
					mobileNetworkTranslationContext.tech = networkTechnologyLabel;
				}
			} else if (populationCoverage !== null) {
				mobileNetworkTranslationContext = { populationCoverage };
			}

			const recipientCount = country.programs.reduce((total, program) => total + program._count.recipients, 0);
			const sanctionsCondition = getSanctionsCondition(country.sanctions);

			return {
				id: country.id,
				country: {
					isoCode: country.isoCode,
					isActive: country.isActive,
					currency: country.currency,
					defaultPayoutAmount: Number(country.defaultPayoutAmount),
				},
				stats: {
					programCount: country._count.programs,
					recipientCount,
					candidateCount: candidateCountsByCountry.get(country.isoCode) ?? 0,
				},
				cash: {
					condition: cashCondition,
					details: {
						translationKey: cashCondition === CountryCondition.MET ? 'step1.details.cash.met' : 'step1.details.cash.not_met',
						translationContext: { country: countryName },
						source:
							country.microfinanceSourceLink ??
							(cashIsOverridden ? { translationKey: 'step1.source.si_research' } : undefined),
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
										providers: mobileMoneyProviders.map((provider) => provider.name).join(', '),
									}
								: undefined,
						source: { translationKey: 'step1.source.si_research' },
					},
				},
				mobileNetwork: {
					condition: mobileNetworkCondition,
					details: {
						translationKey: mobileNetworkTranslationKey,
						translationContext: mobileNetworkTranslationContext,
						source: country.networkSourceLink ?? undefined,
					},
				},
				sanctions: {
					condition: sanctionsCondition,
					details: {
						translationKey:
							sanctionsCondition === CountryCondition.RESTRICTIONS_APPLY
								? 'step1.details.sanctions.restrictions_apply'
								: 'step1.details.sanctions.met',
						translationContext: { country: countryName },
						source: country.sanctions.length > 0 ? { translationKey: 'step1.source.sanctions_lists' } : undefined,
					},
				},
			};
		});

		return resultOk({ rows });
	} catch (error) {
		console.error('Could not fetch program country feasibility', { error });

		return resultFail('Could not fetch program country feasibility');
	}
};

export const getPublicCountryStatsByIsoCode = async (isoCode: string): Promise<ServiceResult<PublicCountryStats>> => {
	const normalizedIsoCode = isoCode.trim().toUpperCase();
	if (!isValidCountryCode(normalizedIsoCode)) {
		return resultFail(normalizedIsoCode ? 'Country not found' : 'Missing isoCode');
	}

	const statsByIsoCodesResult = await getPublicCountryStatsByIsoCodes([normalizedIsoCode]);
	if (!statsByIsoCodesResult.success) {
		return resultFail(statsByIsoCodesResult.error);
	}

	const countryStats = statsByIsoCodesResult.data[normalizedIsoCode];

	return countryStats ? resultOk(countryStats) : resultFail('Country not found');
};

export const getPublicCountryStatsByIsoCodes = async (isoCodes: string[]): Promise<ServiceResult<PublicCountryStatsMap>> => {
	try {
		const normalizedIsoCodes = [
			...new Set(isoCodes.map((isoCode) => isoCode.trim().toUpperCase()).filter(isValidCountryCode)),
		];
		if (normalizedIsoCodes.length === 0) {
			return resultOk({});
		}

		const countries = await countryRepository.findPublicCountryStats(normalizedIsoCodes);
		const statsByIsoCode: PublicCountryStatsMap = {};
		for (const country of countries) {
			statsByIsoCode[country.isoCode] = {
				programsCount: country._count.programs,
				recipientsCount: country.programs.reduce((total, program) => total + program._count.recipients, 0),
			};
		}

		return resultOk(statsByIsoCode);
	} catch (error) {
		console.error('Could not load country stats map', { error });

		return resultFail('Could not load country stats map');
	}
};

export const getCountryStatisticsComparison = async (
	countryCode: CountryCode,
	visitorCountryCode: CountryCode,
): Promise<ServiceResult<CountryStatisticRow[]>> => {
	const [countryValuesResult, visitorValuesResult] = await Promise.all([
		loadCountryStatisticValues(countryCode),
		loadCountryStatisticValues(visitorCountryCode),
	]);
	if (!countryValuesResult.success) {
		return countryValuesResult;
	}
	if (!visitorValuesResult.success) {
		return visitorValuesResult;
	}

	const rows = COUNTRY_STATISTIC_DEFINITIONS.flatMap((definition) => {
		const countryValue = countryValuesResult.data[definition.key];
		const visitorValue = visitorValuesResult.data[definition.key];
		if (countryValue === null || visitorValue === null) {
			return [];
		}

		return [
			{
				key: definition.key,
				labelKey: definition.labelKey,
				format: definition.format,
				countryValue,
				visitorValue,
			},
		];
	});

	return resultOk(rows);
};

export const createCountry = async (userId: string, input: CountryCreateInput): Promise<ServiceResult<CountryPayload>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const existingCountry = await countryRepository.findCountryByIsoCode(input.isoCode);
		if (existingCountry) {
			return resultFail('A country with this ISO code already exists.');
		}

		return resultOk(toCountryPayload(await countryRepository.createCountry(input)));
	} catch (error) {
		console.error('Could not create country', { error });

		return resultFail('Could not create country. Please try again later.');
	}
};

export const updateCountry = async (userId: string, input: CountryUpdateInput): Promise<ServiceResult<CountryPayload>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const existingCountry = await countryRepository.findCountryById(input.id);
		if (!existingCountry) {
			return resultFail('Country not found');
		}
		if (input.isoCode !== existingCountry.isoCode) {
			const conflictingCountry = await countryRepository.findCountryByIsoCode(input.isoCode);
			if (conflictingCountry && conflictingCountry.id !== input.id) {
				return resultFail('A country with this ISO code already exists.');
			}
		}

		return resultOk(toCountryPayload(await countryRepository.updateCountry(input)));
	} catch (error) {
		console.error('Could not update country', { countryId: input.id, error });

		return resultFail('Could not update country. Please try again later.');
	}
};

export const deleteCountry = async (userId: string, countryId: string): Promise<ServiceResult<{ id: string }>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const country = await countryRepository.findCountryForDeletion(countryId);
		if (!country) {
			return resultFail('Country not found');
		}
		if (country._count.programs > 0) {
			return resultFail('Cannot delete country because it is still used by programs');
		}

		await countryRepository.deleteCountry(countryId);

		return resultOk({ id: countryId });
	} catch (error) {
		console.error('Could not delete country', { countryId, error });

		return resultFail('Could not delete country');
	}
};

const toCountryPayload = (country: CountryRecord): CountryPayload => ({
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
	mobileMoneyProviders: country.mobileMoneyProviders.map(({ mobileMoneyProvider }) => mobileMoneyProvider),
	mobileMoneyConditionOverride: country.mobileMoneyConditionOverride ?? false,
	sanctions: country.sanctions,
	microfinanceSourceLink: country.microfinanceSourceLink,
	networkSourceLink: country.networkSourceLink,
});

const loadCountryStatisticValues = async (countryCode: CountryCode): Promise<ServiceResult<CountryStatisticValueMap>> => {
	const indicatorResults = await Promise.all(
		COUNTRY_STATISTIC_DEFINITIONS.map(async (definition) => ({
			key: definition.key,
			result: await fetchWorldBankIndicator(countryCode, definition.indicator),
		})),
	);
	const values: CountryStatisticValueMap = {
		population: null,
		growthRate: null,
		literacyRate: null,
		povertyLevel: null,
		lifeExpectancy: null,
	};
	for (const { key, result } of indicatorResults) {
		if (!result.success) {
			return resultFail(result.error);
		}
		values[key] = result.data;
	}

	return resultOk(values);
};

const getCashCondition = (microfinanceIndex: number | null, overwriteCondition: boolean): CountryCondition => {
	if (overwriteCondition) {
		return CountryCondition.MET;
	}

	return microfinanceIndex !== null && microfinanceIndex >= 3.5 ? CountryCondition.MET : CountryCondition.NOT_MET;
};

const getMobileMoneyCondition = (
	mobileMoneyProviders: MobileMoneyProviderRef[],
	overwriteCondition: boolean,
): CountryCondition =>
	overwriteCondition || mobileMoneyProviders.length > 0 ? CountryCondition.MET : CountryCondition.NOT_MET;

const getMobileNetworkCondition = (populationCoverage: number | null): CountryCondition =>
	populationCoverage !== null && populationCoverage >= 50 ? CountryCondition.MET : CountryCondition.NOT_MET;

const getNetworkTechnologyLabel = (networkTechnology: NetworkTechnology | null): string | undefined =>
	networkTechnology ? NETWORK_TECH_LABELS[networkTechnology] : undefined;

const getSanctionsCondition = (sanctions: SanctionRegime[]): CountryCondition =>
	sanctions.length > 0 ? CountryCondition.RESTRICTIONS_APPLY : CountryCondition.MET;
