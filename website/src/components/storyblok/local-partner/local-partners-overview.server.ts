import type { AnySearchParams } from '@/app/page-props';
import { getQueryValue } from '@/components/filters/filter-query';
import type { FilterStatus } from '@/components/filters/status-filter';
import { getCountryNameFromIsoCode } from '@/lib/types/country';
import type { PublicLocalPartnerOverviewStatsMap } from '@/modules/local-partners/local-partner.types';
import type { LocalPartnerStory } from './local-partner.types';
import {
	getLocalPartnerDescription,
	getLocalPartnerIsoCode,
	getLocalPartnerPortalSlug,
	getLocalPartnerSlug,
	getLocalPartnerTitle,
} from './local-partner.utils';
import { COUNTRY_QUERY_KEY } from './local-partners-overview-query';

export type FilterOption = {
	value: string;
	label: string;
};

export const getCountryQuery = (searchParams?: AnySearchParams) => {
	return getQueryValue(searchParams, COUNTRY_QUERY_KEY).toUpperCase();
};

const normalizeSearchValue = (value: string) => value.toLowerCase();

const getNormalizedIsoCode = (localPartner: LocalPartnerStory) =>
	getLocalPartnerIsoCode(localPartner.content)?.toUpperCase();

export const localPartnerMatchesSearchQuery = (localPartner: LocalPartnerStory, searchQuery: string) => {
	const countryIsoCode = getLocalPartnerIsoCode(localPartner.content) ?? '';
	const keywords = [
		getLocalPartnerTitle(localPartner.content),
		getLocalPartnerSlug(localPartner),
		getLocalPartnerDescription(localPartner.content),
		countryIsoCode,
		getCountryNameFromIsoCode(countryIsoCode),
	]
		.map((value) => normalizeSearchValue(value))
		.join(' ');
	const searchTerms = normalizeSearchValue(searchQuery).split(/\s+/).filter(Boolean);

	return searchTerms.length > 0 && searchTerms.every((term) => keywords.includes(term));
};

export const localPartnerMatchesCountryQuery = (
	localPartner: LocalPartnerStory,
	selectedCountryIsoCode: string | undefined,
) => {
	if (!selectedCountryIsoCode) {
		return true;
	}

	return getNormalizedIsoCode(localPartner) === selectedCountryIsoCode;
};

// A partnership is concluded once none of its recipients is active or still to start; partners without stats count as active
export const getLocalPartnerStatus = (
	localPartner: LocalPartnerStory,
	statsByPortalSlug: PublicLocalPartnerOverviewStatsMap,
): FilterStatus =>
	statsByPortalSlug[getLocalPartnerPortalSlug(localPartner.content)]?.isConcluded ? 'concluded' : 'active';

export const getCountryFilterOptions = (localPartners: LocalPartnerStory[]): FilterOption[] => {
	const optionsByCountryIsoCode = new Map<string, FilterOption>();

	localPartners.forEach((localPartner) => {
		const countryIsoCode = getNormalizedIsoCode(localPartner);

		if (countryIsoCode) {
			optionsByCountryIsoCode.set(countryIsoCode, {
				value: countryIsoCode,
				label: getCountryNameFromIsoCode(countryIsoCode),
			});
		}
	});

	return [...optionsByCountryIsoCode.values()].sort((optionA, optionB) => optionA.label.localeCompare(optionB.label));
};
