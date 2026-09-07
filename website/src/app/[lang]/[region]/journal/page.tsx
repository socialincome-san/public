import { DefaultPageProps } from '@/app/[lang]/[region]';
import { JournalOverview } from '@/components/storyblok/journal/journal-overview';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { parseJournalArticleTypeSlug, parseJournalTagSlug } from '@/lib/services/journal/journal.utils';
import { services } from '@/lib/services/services';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function Page({ params, searchParams }: DefaultPageProps) {
	const { lang, region } = await params;
	const resolvedSearchParams = await searchParams;
	const tagSlug = parseJournalTagSlug(resolvedSearchParams);
	const articleTypeSlug = parseJournalArticleTypeSlug(resolvedSearchParams);

	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-journal', 'common', 'website-common'],
	});

	const pageResult = await services.journal.getOverviewPageData(
		lang,
		region,
		{
			homeLabel: translator.t('breadcrumb.home', { namespace: 'website-common' }),
			journalLabel: translator.t('overview.title'),
			overviewTitle: translator.t('overview.title'),
			overviewDescription: translator.t('overview.description'),
		},
		{ tagSlug, articleTypeSlug },
	);

	if (!pageResult.success) {
		notFound();
	}

	return (
		<JournalOverview
			{...pageResult.data}
			editorsHeading={translator.t('overview.editors')}
			allArticleTypesLabel={translator.t('overview.all')}
			moreArticlesLabel={translator.t('overview.more-articles')}
			videoLabel={translator.t('badge.video')}
			lang={lang}
			region={region}
		/>
	);
}
