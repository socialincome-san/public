import { getPageMetadata } from '@/app/[lang]/[currency]/page-metadata';
import { getPublishedSlugParams } from '@/app/[lang]/[currency]/published-slug-params';
import { ArticleDetail } from '@/components/storyblok/journal/article-detail';
import { JsonLd } from '@/components/structured-data/json-ld';
import { toWebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { getArticlePageMetadata, getArticlePageStructuredData } from '@/lib/storyblok/storyblok-utils';
import { getJournalArticle, getJournalArticlePageData } from '@/modules/journal/journal.cache';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

type JournalArticlePageProps = {
	params: Promise<{ slug: string; lang: WebsiteLanguage; currency: string }>;
};

export const generateStaticParams = () => getPublishedSlugParams('journal');

export const generateMetadata = async (props: JournalArticlePageProps) => {
	const { slug, lang } = await props.params;
	const articleResponse = await getJournalArticle(lang, slug);

	return getPageMetadata(
		lang,
		`journal/${slug}`,
		articleResponse.success ? getArticlePageMetadata(articleResponse.data, lang) : {},
	);
};

export default async function Page(props: JournalArticlePageProps) {
	const { slug, lang, currency: currencySegment } = await props.params;
	const currency = toWebsiteCurrency(currencySegment);

	const [t, tCommon] = await Promise.all([getTranslations('website-journal'), getTranslations('website-common')]);

	const pageResult = await getJournalArticlePageData({
		lang,
		currency,
		slug,
		parentLabel: t('overview.title'),
		homeLabel: tCommon('breadcrumb.home'),
	});

	if (!pageResult.success) {
		notFound();
	}

	return (
		<>
			<JsonLd data={getArticlePageStructuredData(pageResult.data.story, lang, slug)} />
			<ArticleDetail
				story={pageResult.data.story}
				slug={slug}
				lang={lang}
				currency={currency}
				relatedArticles={pageResult.data.relatedArticles}
				breadcrumbs={pageResult.data.breadcrumbs}
			/>
		</>
	);
}
