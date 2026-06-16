import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { StoryblokPreviewCountriesOverviewPage } from '@/components/storyblok/storyblok-preview-countries-overview-page';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getCountriesOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';

type PreviewPageProps = DefaultLayoutProps & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function CountriesOverviewPreviewRoute({ params, searchParams }: PreviewPageProps) {
	const { lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewCountriesOverviewPage
			storyPath={getCountriesOverviewStoryPath()}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			previewRoutePath={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/countries/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}
