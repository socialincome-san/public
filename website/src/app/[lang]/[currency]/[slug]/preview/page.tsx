import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[currency]';
import { StoryblokPreviewPage } from '@/components/storyblok/storyblok-preview-page';
import { getWebsiteBasePath, toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getPageStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, currency } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewPage
			storyPath={getPageStoryPath(slug)}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			previewRoutePath={`${getWebsiteBasePath(lang, toWebsiteCurrency(currency))}/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}
