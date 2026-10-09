import { StoryblokPreviewJournalArticlePage } from '@/components/storyblok/storyblok-preview-journal-article-page';
import { getWebsiteBasePath, toWebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { getJournalArticleStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = {
	params: Promise<{ slug: string; lang: WebsiteLanguage; currency: string }>;
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewJournalArticlePage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, currency: currencySegment } = await params;
	const currency = toWebsiteCurrency(currencySegment);
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewJournalArticlePage
			storyPath={getJournalArticleStoryPath(slug)}
			slug={slug}
			lang={lang}
			currency={currency}
			previewRoutePath={`${getWebsiteBasePath(lang, currency)}/journal/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}
