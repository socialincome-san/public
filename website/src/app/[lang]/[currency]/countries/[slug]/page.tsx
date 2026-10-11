import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[currency]';
import { pickCommunityPage } from '@/components/community/pick-community-page';
import { CountryDetail } from '@/components/storyblok/country/country-detail';
import { toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getWebsiteAlternates } from '@/lib/utils/metadata';
import { getCommunityPanelData } from '@/modules/community/community.cache';
import { getCountryPageStats } from '@/modules/countries/country.cache';
import { getCountryBySlug } from '@/modules/storyblok-content/storyblok-content.cache';
import { notFound } from 'next/navigation';

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug) => {
	const { lang, slug } = await params;

	return getWebsiteAlternates(lang as WebsiteLanguage, `countries/${slug}`);
};

export default async function CountryPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, currency } = await params;
	const countryResult = await getCountryBySlug(slug, lang);

	if (!countryResult.success) {
		return notFound();
	}

	const [statsResult, communityResult] = await Promise.all([
		getCountryPageStats(countryResult.data.content.isoCode.toString()),
		getCommunityPanelData(pickCommunityPage(countryResult.data.content), lang, toWebsiteCurrency(currency)),
	]);
	const { activeProgramsCount, recipientsCount } = statsResult.success
		? statsResult.data
		: { activeProgramsCount: 0, recipientsCount: 0 };

	return (
		<CountryDetail
			country={countryResult.data}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			activeProgramsCount={activeProgramsCount}
			recipientsCount={recipientsCount}
			community={communityResult.success ? communityResult.data : null}
		/>
	);
}
