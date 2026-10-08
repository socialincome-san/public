import { JournalOverview } from '@/components/storyblok/journal/journal-overview';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getJournalOverviewPageData } from '@/modules/journal/journal.cache';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

type JournalOverviewPageProps = {
	params: Promise<{ lang: WebsiteLanguage; region: WebsiteRegion }>;
	searchParams: Promise<Record<string, string>>;
};

export default async function Page({ params, searchParams }: JournalOverviewPageProps) {
	const { lang, region } = await params;
	const resolvedSearchParams = await searchParams;
	const tagSlug = typeof resolvedSearchParams.tag === 'string' ? resolvedSearchParams.tag : undefined;
	const articleTypeSlug = typeof resolvedSearchParams.type === 'string' ? resolvedSearchParams.type : undefined;

	const [t, tCommon] = await Promise.all([getTranslations('website-journal'), getTranslations('website-common')]);

	const pageResult = await getJournalOverviewPageData({
		lang,
		region,
		labels: {
			homeLabel: tCommon('breadcrumb.home'),
			journalLabel: t('overview.title'),
			overviewTitle: t('overview.title'),
			overviewDescription: t('overview.description'),
		},
		filter: { tagSlug, articleTypeSlug },
	});

	if (!pageResult.success) {
		notFound();
	}

	return (
		<JournalOverview
			{...pageResult.data}
			editorsHeading={t('overview.editors')}
			allArticleTypesLabel={t('overview.all')}
			articleCountLabel={t('overview.article-count', { count: pageResult.data.articles.length })}
			moreArticlesLabel={t('overview.more-articles')}
			videoLabel={t('badge.video')}
			lang={lang}
			region={region}
		/>
	);
}
