import { ArticleDetail } from '@/components/storyblok/journal/article-detail';
import { toWebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { createWebsiteJournalArticleCanonicalUrl, generateMetaDataForArticle } from '@/lib/storyblok/storyblok-utils';
import { getWebsiteAlternates } from '@/lib/utils/metadata';
import { getJournalArticle, getJournalArticlePageData } from '@/modules/journal/journal.cache';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

type JournalArticlePageProps = {
	params: Promise<{ slug: string; lang: WebsiteLanguage; currency: string }>;
};

export const generateMetadata = async (props: JournalArticlePageProps) => {
	const { slug, lang } = await props.params;
	const articleResponse = await getJournalArticle(lang, slug);
	if (!articleResponse.success) {
		return {};
	}

	return {
		...generateMetaDataForArticle(
			articleResponse.data,
			createWebsiteJournalArticleCanonicalUrl(articleResponse.data.slug, lang),
		),
		...getWebsiteAlternates(lang, `journal/${slug}`),
	};
};

export default async function Page(props: JournalArticlePageProps) {
	const { slug, lang, currency: currencySegment } = await props.params;
	const currency = toWebsiteCurrency(currencySegment);

	const [t, tCommon] = await Promise.all([getTranslations('website-journal'), getTranslations('website-common')]);

	const pageResult = await getJournalArticlePageData({
		lang,
		currency,
		slug,
		journalLabel: t('overview.title'),
		homeLabel: tCommon('breadcrumb.home'),
	});

	if (!pageResult.success) {
		notFound();
	}

	return (
		<ArticleDetail
			story={pageResult.data.story}
			slug={slug}
			lang={lang}
			currency={currency}
			relatedArticles={pageResult.data.relatedArticles}
			breadcrumbs={pageResult.data.breadcrumbs}
		/>
	);
}
