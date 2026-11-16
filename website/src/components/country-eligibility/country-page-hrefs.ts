import { getCountryIsoCode, getCountrySlug } from '@/components/storyblok/country/country.utils';
import { getWebsiteBasePath, type WebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { getCountriesAction } from '@/modules/storyblok-content/storyblok-content.actions';

export type CountryPageHrefs = Record<string, string>;

/** Country pages by ISO code; countries without a published page are missing. */
export const getCountryPageHrefs = async (lang: WebsiteLanguage, currency: WebsiteCurrency): Promise<CountryPageHrefs> => {
	const result = await getCountriesAction(lang);

	if (!result.success) {
		return {};
	}

	return Object.fromEntries(
		// A country story saved without an ISO code cannot be matched to a row
		result.data
			.filter((country) => country.content.isoCode !== null && country.content.isoCode !== undefined)
			.map((country) => [
				// Editors enter the code in either case; the database uses upper case
				getCountryIsoCode(country.content).toUpperCase(),
				`${getWebsiteBasePath(lang, currency)}/countries/${getCountrySlug(country)}`,
			]),
	);
};
