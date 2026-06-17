import { getCountryDescription, getCountrySlug, getCountryTitle } from '@/components/storyblok/country/country.utils';
import type { Country } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { getCountryNameByCode, isValidCountryCode } from '@/lib/types/country';

export const getCountryNameFromIsoCode = (countryIsoCode: string): string =>
	isValidCountryCode(countryIsoCode) ? getCountryNameByCode(countryIsoCode) : countryIsoCode;

export type ResolvedProgramCountry = {
	isoCode: string;
	name: string;
	description?: Country['description'];
	href?: string;
};

export const resolveProgramCountry = async (
	countryIsoCode: string | undefined,
	lang: WebsiteLanguage,
	region: WebsiteRegion,
): Promise<ResolvedProgramCountry | undefined> => {
	if (!countryIsoCode || countryIsoCode === '-') {
		return undefined;
	}

	let resolvedCountry: ResolvedProgramCountry | undefined;

	try {
		const countryResult = await services.storyblok.getCountryByIsoCode(countryIsoCode, lang);

		if (countryResult.success) {
			resolvedCountry = {
				isoCode: countryIsoCode,
				name: getCountryTitle(countryResult.data.content),
				description: getCountryDescription(countryResult.data.content),
				href: `/${lang}/${region}/countries/${getCountrySlug(countryResult.data)}`,
			};
		}
	} finally {
		if (!resolvedCountry) {
			resolvedCountry = {
				isoCode: countryIsoCode,
				name: getCountryNameFromIsoCode(countryIsoCode),
			};
		}
	}

	return resolvedCountry;


};
