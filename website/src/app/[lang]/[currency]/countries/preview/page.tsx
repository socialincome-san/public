import { DefaultLayoutProps } from '@/app/[lang]/[currency]';
import { StoryblokPreviewCountriesOverviewPage } from '@/components/storyblok/storyblok-preview-countries-overview-page';
import { getWebsiteBasePath, toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getCountriesOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function CountriesOverviewPreviewRoute({ params, searchParams }: PreviewPageProps) {
	const { lang, currency } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewCountriesOverviewPage
			storyPath={getCountriesOverviewStoryPath()}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			previewRoutePath={`${getWebsiteBasePath(lang, toWebsiteCurrency(currency))}/countries/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}
