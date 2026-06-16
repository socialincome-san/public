import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[region]';
import { StoryblokPreviewJournalArticlePage } from '@/components/storyblok/storyblok-preview-journal-article-page';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getJournalArticleStoryPath } from '@/lib/storyblok/storyblok-paths';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewJournalArticlePage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewJournalArticlePage
			storyPath={getJournalArticleStoryPath(slug)}
			slug={slug}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			previewRoutePath={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/journal/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}
