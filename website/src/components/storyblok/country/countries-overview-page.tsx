import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { CountriesOverview } from '@/components/storyblok/country/countries-overview';
import type { CountryStory } from '@/components/storyblok/country/country.types';
import { getCountryIsoCode } from '@/components/storyblok/country/country.utils';
import type { CountryOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	overview: ISbStoryData<CountryOverview>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CountriesOverviewPage = async ({ overview, lang, region }: Props) => {
	const countriesResult = await services.storyblok.getCountries(lang);
	const countries = (countriesResult.success ? countriesResult.data : []) as CountryStory[];
	const isoCodes = [...new Set(countries.map((country) => getCountryIsoCode(country.content)).filter(Boolean))];
	const statsResult = await services.read.country.getPublicCountryStatsByIsoCodes(isoCodes);
	const statsByIsoCode = statsResult.success ? statsResult.data : {};
	const title = overview.content.title?.trim() ?? overview.name;
	const text = overview.content.text?.trim();
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug: overview.full_slug,
		currentLabel: title,
		lang,
		region,
	});

	return (
		<div className="w-site-width max-w-content mx-auto flex flex-col gap-8 px-6 py-8">
			<Breadcrumb links={breadcrumbLinks} className="py-0" />
			<CountriesOverview
				countries={countries}
				statsByIsoCode={statsByIsoCode}
				lang={lang}
				region={region}
				title={title}
				text={text}
			/>
		</div>
	);
};
