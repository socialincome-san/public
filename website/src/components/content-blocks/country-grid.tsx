import { BlockWrapper } from '@/components/block-wrapper';
import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { CountriesOverview } from '@/components/storyblok/country/countries-overview';
import { getCountryIsoCode } from '@/components/storyblok/country/country.utils';
import type { CountryGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: CountryGrid;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CountryGridBlock = async ({ blok, lang, region }: Props) => {
	const countriesResult = await services.storyblok.getCountries(lang);
	const allCountries = countriesResult.success ? countriesResult.data : [];
	const countries = blok.showAllCountries ? allCountries : resolveSelectedStories(blok.countries, allCountries);
	const isoCodes = [...new Set(countries.map((country) => getCountryIsoCode(country.content)).filter(Boolean))];
	const statsResult = await services.read.country.getPublicCountryStatsByIsoCodes(isoCodes);
	const statsByIsoCode = statsResult.success ? statsResult.data : {};

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<CountriesOverview countries={countries} statsByIsoCode={statsByIsoCode} lang={lang} region={region} />
		</BlockWrapper>
	);
};
