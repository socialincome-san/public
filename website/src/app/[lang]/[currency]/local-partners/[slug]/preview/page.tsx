import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[currency]';
import { StoryblokPreviewLocalPartnerPage } from '@/components/storyblok/storyblok-preview-local-partner-page';
import { getWebsiteBasePath, toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getLocalPartnerStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewLocalPartnerPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, currency } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewLocalPartnerPage
			storyPath={getLocalPartnerStoryPath(slug)}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			previewRoutePath={`${getWebsiteBasePath(lang, toWebsiteCurrency(currency))}/local-partners/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}
