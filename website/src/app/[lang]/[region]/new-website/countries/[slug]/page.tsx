import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { CountryDetail } from '@/components/storyblok/country/country-detail';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function CountryPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, region } = await params;
	const countryResult = await services.storyblok.getCountryBySlug(slug, lang);

	if (!countryResult.success) {
		return notFound();
	}

	const isoCode = countryResult.data.content.isoCode;
	const statsResult = await services.read.country.getPublicCountryStatsByIsoCode(isoCode);
	const activeProgramsCount = statsResult.success ? statsResult.data.programsCount : 0;
	const recipientsCount = statsResult.success ? statsResult.data.recipientsCount : 0;

	return (
		<CountryDetail
			country={countryResult.data}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			activeProgramsCount={activeProgramsCount}
			recipientsCount={recipientsCount}
		/>
	);
}
