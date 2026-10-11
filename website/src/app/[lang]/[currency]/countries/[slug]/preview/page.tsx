import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[currency]';
import { StoryblokPreviewCountryPage } from '@/components/storyblok/storyblok-preview-country-page';
import { getWebsiteBasePath, toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getCountryStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewCountryPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, currency } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewCountryPage
			storyPath={getCountryStoryPath(slug)}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			previewRoutePath={`${getWebsiteBasePath(lang, toWebsiteCurrency(currency))}/countries/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}
