import { StoryblokPreviewPersonPage } from '@/components/storyblok/storyblok-preview-person-page';
import { getWebsiteBasePath, toWebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { getPersonStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = {
	params: Promise<{ slug: string; lang: WebsiteLanguage; currency: string }>;
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewPersonPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, currency: currencySegment } = await params;
	const currency = toWebsiteCurrency(currencySegment);
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewPersonPage
			storyPath={getPersonStoryPath(slug)}
			slug={slug}
			lang={lang}
			currency={currency}
			previewRoutePath={`${getWebsiteBasePath(lang, currency)}/person/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}
