import { DefaultLayoutProps } from '@/app/[lang]/[currency]';
import { StoryblokPreviewFocusesOverviewPage } from '@/components/storyblok/storyblok-preview-focuses-overview-page';
import { getWebsiteBasePath, toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getFocusesOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function FocusesOverviewPreviewRoute({ params, searchParams }: PreviewPageProps) {
	const { lang, currency } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewFocusesOverviewPage
			storyPath={getFocusesOverviewStoryPath()}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			previewRoutePath={`${getWebsiteBasePath(lang, toWebsiteCurrency(currency))}/focuses/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}
