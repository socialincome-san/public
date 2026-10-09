import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { CountryDetail } from '@/components/storyblok/country/country-detail';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getCommunityPanelData } from '@/modules/community/community.service';
import { getCountryPageStats } from '@/modules/countries/country.service';
import { getCountryBySlug } from '@/modules/storyblok-content/storyblok-content.service';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function CountryPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, region } = await params;
	const countryResult = await getCountryBySlug(slug, lang);

	if (!countryResult.success) {
		return notFound();
	}

	const [statsResult, communityResult] = await Promise.all([
		getCountryPageStats(countryResult.data.content.isoCode.toString()),
		getCommunityPanelData(countryResult.data.content, lang, region),
	]);
	const { activeProgramsCount, recipientsCount, candidatesCount } = statsResult.success
		? statsResult.data
		: { activeProgramsCount: 0, recipientsCount: 0, candidatesCount: 0 };

	return (
		<CountryDetail
			country={countryResult.data}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			activeProgramsCount={activeProgramsCount}
			recipientsCount={recipientsCount}
			candidatesCount={candidatesCount}
			community={communityResult.success ? communityResult.data : null}
		/>
	);
}
