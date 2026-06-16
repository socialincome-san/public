import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { ArticleDetail } from '@/components/storyblok/journal/article-detail';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import {
	createNewWebsiteJournalArticleCanonicalUrl,
	generateMetaDataForArticle,
} from '@/lib/services/storyblok/storyblok.utils';
import { notFound } from 'next/navigation';
import { cache } from 'react';

export const revalidate = 900;

const getArticle = cache((lang: string, slug: string) => services.storyblok.getArticle(lang, slug));

export const generateMetadata = async (props: DefaultLayoutPropsWithSlug) => {
	const { slug, lang } = await props.params;
	const articleResponse = await getArticle(lang, slug);
	if (!articleResponse.success) {
		return {};
	}

	return generateMetaDataForArticle(
		articleResponse.data,
		createNewWebsiteJournalArticleCanonicalUrl(articleResponse.data.slug, lang),
	);
};

export default async function Page(props: DefaultLayoutPropsWithSlug) {
	const { slug, lang, region } = await props.params;

	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-journal', 'common', 'website-newsletter'],
	});

	const pageResult = await services.journal.getArticlePageData(lang, region, slug, translator.t('overview.title'));

	if (!pageResult.success) {
		notFound();
	}

	return (
		<ArticleDetail
			story={pageResult.data.story}
			slug={slug}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			relatedArticles={pageResult.data.relatedArticles}
			translator={translator}
			breadcrumbs={pageResult.data.breadcrumbs}
		/>
	);
}
