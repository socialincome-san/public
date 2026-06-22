import { ArticleDetail } from '@/components/storyblok/journal/article-detail';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { ResolvedArticle } from '@/lib/services/storyblok/storyblok.utils';
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
		namespaces: ['website-journal', 'common', 'website-newsletter'],
	});

	return await StoryblokPreviewStory<ISbStoryData<ResolvedArticle>>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (_path, language) => {
			const storyResult = await services.storyblok.getArticle(language, slug);

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: async (story) => {
			const pageResult = await services.journal.getArticlePageData(lang, region, slug, translator.t('overview.title'));

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
