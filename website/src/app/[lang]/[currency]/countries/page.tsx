import { DefaultLayoutProps, DefaultPageProps } from '@/app/[lang]/[currency]';
import { CountriesOverviewPage } from '@/components/storyblok/country/countries-overview-page';
import type { CountryOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getCountriesOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';
import { getWebsiteAlternates } from '@/lib/utils/metadata';
import { getStoryWithFallback } from '@/modules/storyblok-content/storyblok-content.cache';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export const generateMetadata = async ({ params }: DefaultLayoutProps) =>
	getWebsiteAlternates((await params).lang as WebsiteLanguage, 'countries');

export default async function CountriesOverviewRoute({ params }: DefaultPageProps) {
	const { lang, currency } = await params;
	const overviewResult = await getStoryWithFallback<ISbStoryData<CountryOverview>>(getCountriesOverviewStoryPath(), lang);

	if (!overviewResult.success) {
		return notFound();
	}

	return (
		<CountriesOverviewPage
			overview={overviewResult.data}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
		/>
	);
}
