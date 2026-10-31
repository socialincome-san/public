import { ArticleDetail } from '@/components/storyblok/journal/article-detail';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getArticleAuthors } from '@/lib/storyblok/storyblok-utils';
import { getJournalArticleAction, getJournalArticlePageDataAction } from '@/modules/journal/journal.actions';
import type { JournalArticle } from '@/modules/journal/journal.types';
import type { ISbStoryData } from '@storyblok/js';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

type Props = {
	storyPath: string;
	slug: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewJournalArticlePage = async ({
	storyPath,
	slug,
	lang,
	currency,
	previewRoutePath,
	searchParams,
}: Props) => {
	const [t, tCommon] = await Promise.all([getTranslations('website-journal'), getTranslations('website-common')]);

	return await StoryblokPreviewStory<ISbStoryData<JournalArticle>>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (_path, language) => {
			const storyResult = await getJournalArticleAction({ slug, language });

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: async (story) => {
			const pageResult = await getJournalArticlePageDataAction({
				lang,
				currency,
				slug,
				parentLabel: t('overview.title'),
				homeLabel: tCommon('breadcrumb.home'),
			});

			if (!pageResult.success) {
				return notFound();
			}

			// The visual editor sends unsaved author changes in `story`, so only the counts come from the saved article
			const articleCounts = new Map(pageResult.data.authors.map(({ person, articleCount }) => [person.uuid, articleCount]));

			return (
				<ArticleDetail
					story={story}
					slug={slug}
					lang={lang}
					currency={currency}
					authors={getArticleAuthors(story.content).map((person) => ({
						person,
						articleCount: articleCounts.get(person.uuid) ?? 0,
					}))}
					roleLabels={pageResult.data.roleLabels}
					circleLabels={pageResult.data.circleLabels}
					relatedArticles={pageResult.data.relatedArticles}
					breadcrumbs={pageResult.data.breadcrumbs}
				/>
			);
		},
	});
};
