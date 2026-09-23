import { ArticleDetail } from '@/components/storyblok/journal/article-detail';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getJournalArticleAction, getJournalArticlePageDataAction } from '@/modules/journal/journal.actions';
import type { JournalArticle } from '@/modules/journal/journal.types';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

type Props = {
	storyPath: string;
	slug: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewJournalArticlePage = async ({
	storyPath,
	slug,
	lang,
	region,
	previewRoutePath,
	searchParams,
}: Props) => {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal', 'common', 'website-newsletter', 'website-common'],
	});

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
				region,
				slug,
				journalLabel: translator.t('overview.title'),
				homeLabel: translator.t('breadcrumb.home', { namespace: 'website-common' }),
			});

			if (!pageResult.success) {
				return notFound();
			}

			return (
				<ArticleDetail
					story={story}
					slug={slug}
					lang={lang}
					region={region}
					relatedArticles={pageResult.data.relatedArticles}
					translator={translator}
					breadcrumbs={pageResult.data.breadcrumbs}
				/>
			);
		},
	});
};
