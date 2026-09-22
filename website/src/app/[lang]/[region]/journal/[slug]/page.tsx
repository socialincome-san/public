import { ArticleDetail } from '@/components/storyblok/journal/article-detail';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { createWebsiteJournalArticleCanonicalUrl, generateMetaDataForArticle } from '@/lib/storyblok/storyblok-utils';
import { getJournalArticle, getJournalArticlePageData } from '@/modules/journal/journal.service';
import { notFound } from 'next/navigation';
import { cache } from 'react';

export const revalidate = 900;

type JournalArticlePageProps = {
	params: Promise<{ slug: string; lang: WebsiteLanguage; region: WebsiteRegion }>;
};

const getArticle = cache((lang: string, slug: string) => getJournalArticle(lang, slug));

export const generateMetadata = async (props: JournalArticlePageProps) => {
	const { slug, lang } = await props.params;
	const articleResponse = await getArticle(lang, slug);
	if (!articleResponse.success) {
		return {};
	}

	return generateMetaDataForArticle(
		articleResponse.data,
		createWebsiteJournalArticleCanonicalUrl(articleResponse.data.slug, lang),
	);
};

export default async function Page(props: JournalArticlePageProps) {
	const { slug, lang, region } = await props.params;

	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal', 'common', 'website-newsletter', 'website-common'],
	});

	const pageResult = await getJournalArticlePageData({
		lang,
		region,
		slug,
		journalLabel: translator.t('overview.title'),
		homeLabel: translator.t('breadcrumb.home', { namespace: 'website-common' }),
	});

	if (!pageResult.success) {
		notFound();
	}

	return (
		<ArticleDetail
			story={pageResult.data.story}
			slug={slug}
			lang={lang}
			region={region}
			relatedArticles={pageResult.data.relatedArticles}
			translator={translator}
			breadcrumbs={pageResult.data.breadcrumbs}
		/>
	);
}
