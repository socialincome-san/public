import { DefaultPageProps } from '@/app/[lang]/[currency]';
import { StoryblokPreviewPage } from '@/components/storyblok/storyblok-preview-page';
import { getWebsiteBasePath, toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getCirclesOverviewStoryPath, WEBSITE_CIRCLE_PATH_SEGMENT } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultPageProps & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function CirclesOverviewPreviewRoute({ params, searchParams }: PreviewPageProps) {
	const { lang, currency } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewPage
			storyPath={getCirclesOverviewStoryPath()}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			previewRoutePath={`${getWebsiteBasePath(lang, toWebsiteCurrency(currency))}/${WEBSITE_CIRCLE_PATH_SEGMENT}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}
