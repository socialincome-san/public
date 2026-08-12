import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { CountryDetail } from '@/components/storyblok/country/country-detail';
import { services } from '@/lib/services/services';
import { getCountryPageStats } from '@/lib/storyblok/country-page-stats';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function CountryPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang } = await params;
	const countryResult = await services.storyblok.getCountryBySlug(slug, lang);

	if (!countryResult.success) {
		return notFound();
	}

	const { activeProgramsCount, recipientsCount } = await getCountryPageStats(countryResult.data.content.isoCode.toString());

	return (
		<CountryDetail
			country={countryResult.data}
			activeProgramsCount={activeProgramsCount}
			recipientsCount={recipientsCount}
		/>
	);
}
