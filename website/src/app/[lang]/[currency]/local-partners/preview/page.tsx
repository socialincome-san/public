import { DefaultLayoutProps } from '@/app/[lang]/[currency]';
import { StoryblokPreviewLocalPartnersOverviewPage } from '@/components/storyblok/storyblok-preview-local-partners-overview-page';
import { getWebsiteBasePath, toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getLocalPartnersOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function LocalPartnersOverviewPreviewRoute({ params, searchParams }: PreviewPageProps) {
	const { lang, currency } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewLocalPartnersOverviewPage
			storyPath={getLocalPartnersOverviewStoryPath()}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			previewRoutePath={`${getWebsiteBasePath(lang, toWebsiteCurrency(currency))}/local-partners/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}
