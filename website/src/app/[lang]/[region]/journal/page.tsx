import { DefaultPageProps } from '@/app/[lang]/[region]';
import { JournalOverview } from '@/components/storyblok/journal/journal-overview';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { parseJournalTagSlug } from '@/lib/services/journal/journal.utils';
import { services } from '@/lib/services/services';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function Page({ params, searchParams }: DefaultPageProps) {
	const { lang, region } = await params;
	const tagSlug = parseJournalTagSlug(await searchParams);

	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-journal', 'common'],
	});

	const pageResult = await services.journal.getOverviewPageData(
		lang,
		region,
		{
			journalLabel: translator.t('overview.title'),
			overviewTitle: translator.t('overview.title'),
			overviewDescription: translator.t('overview.description'),
		},
		tagSlug,
	);

	if (!pageResult.success) {
		notFound();
	}

	return (
		<JournalOverview
			{...pageResult.data}
			editorsHeading={translator.t('overview.editors')}
			allTagsLabel={translator.t('overview.all')}
			moreArticlesLabel={translator.t('overview.more-articles')}
			videoLabel={translator.t('badge.video')}
			lang={lang}
			region={region}
		/>
	);
}
