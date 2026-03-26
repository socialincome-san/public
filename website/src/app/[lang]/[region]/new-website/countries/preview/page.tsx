import { DefaultPageProps } from '@/app/[lang]/[region]';
import { CountriesOverview } from '@/components/storyblok/country/countries-overview';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

export default async function CountriesPreviewPage({ params }: DefaultPageProps) {
	const { lang, region } = await params;
	const countriesResult = await services.storyblok.getCountries(lang);
	const countries = countriesResult.success ? countriesResult.data : [];
	const statsEntries = await Promise.all(
		countries.map(async (country) => {
			const statsResult = await services.read.country.getPublicCountryStatsByIsoCode(country.content.isoCode);

			return [
				country.content.isoCode,
				statsResult.success ? statsResult.data : { programsCount: 0, recipientsCount: 0 },
			] as const;
		}),
	);
	const statsByIsoCode = Object.fromEntries(statsEntries);

	return (
		<CountriesOverview
			countries={countries}
			statsByIsoCode={statsByIsoCode}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
		/>
	);
}
