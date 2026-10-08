import { PersonProfile } from '@/components/storyblok/journal/person-profile';
import { LanguageCode } from '@/lib/types/language';
import { getJournalPersonPageData } from '@/modules/journal/journal.service';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function Page(props: { params: Promise<{ slug: string; lang: LanguageCode; region: string }> }) {
	const { slug, lang, region } = await props.params;

	const [t, tCommon] = await Promise.all([getTranslations('website-journal'), getTranslations('website-common')]);

	const pageResult = await getJournalPersonPageData({
		lang,
		region,
		slug,
		journalLabel: t('overview.title'),
		homeLabel: tCommon('breadcrumb.home'),
	});

	if (!pageResult.success) {
		notFound();
	}

	return (
		<PersonProfile
			{...pageResult.data}
			articlesHeading={t('person.articles')}
			lang={lang}
			region={region}
			moreArticlesLabel={t('overview.more-articles')}
			videoLabel={t('badge.video')}
		/>
	);
}
