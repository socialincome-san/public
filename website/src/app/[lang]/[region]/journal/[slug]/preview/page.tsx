import { StoryblokPreviewJournalArticlePage } from '@/components/storyblok/storyblok-preview-journal-article-page';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getJournalArticleStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = {
	params: Promise<{ slug: string; lang: WebsiteLanguage; region: WebsiteRegion }>;
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewJournalArticlePage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewJournalArticlePage
			storyPath={getJournalArticleStoryPath(slug)}
			slug={slug}
			lang={lang}
			region={region}
			previewRoutePath={`/${lang}/${region}/journal/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}
