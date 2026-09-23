import { JournalOverview } from '@/components/storyblok/journal/journal-overview';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getJournalOverviewPageData } from '@/modules/journal/journal.service';
import { notFound } from 'next/navigation';

export const revalidate = 900;

type JournalOverviewPageProps = {
	params: Promise<{ lang: WebsiteLanguage; region: WebsiteRegion }>;
	searchParams: Promise<Record<string, string>>;
};

export default async function Page({ params, searchParams }: JournalOverviewPageProps) {
	const { lang, region } = await params;
	const resolvedSearchParams = await searchParams;
	const tagSlug = typeof resolvedSearchParams.tag === 'string' ? resolvedSearchParams.tag : undefined;
	const articleTypeSlug = typeof resolvedSearchParams.type === 'string' ? resolvedSearchParams.type : undefined;

	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal', 'common', 'website-common'],
	});

	const pageResult = await getJournalOverviewPageData({
		lang,
		region,
		labels: {
			homeLabel: translator.t('breadcrumb.home', { namespace: 'website-common' }),
			journalLabel: translator.t('overview.title'),
			overviewTitle: translator.t('overview.title'),
			overviewDescription: translator.t('overview.description'),
		},
		filter: { tagSlug, articleTypeSlug },
	});

	if (!pageResult.success) {
		notFound();
	}

	return (
		<JournalOverview
			{...pageResult.data}
			editorsHeading={translator.t('overview.editors')}
			allArticleTypesLabel={translator.t('overview.all')}
			articleCountLabel={translator.t('overview.article-count', {
				context: { count: pageResult.data.articles.length },
			})}
			moreArticlesLabel={translator.t('overview.more-articles')}
			videoLabel={translator.t('badge.video')}
			lang={lang}
			region={region}
		/>
	);
}
