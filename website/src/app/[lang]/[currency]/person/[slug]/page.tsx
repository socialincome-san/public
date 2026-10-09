import type { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[currency]';
import { PersonProfile } from '@/components/storyblok/journal/person-profile';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { toWebsiteCurrency } from '@/lib/i18n/utils';
import { LanguageCode } from '@/lib/types/language';
import { getWebsiteAlternates } from '@/lib/utils/metadata';
import { getJournalPersonPageData } from '@/modules/journal/journal.cache';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug) => {
	const { lang, slug } = await params;

	return getWebsiteAlternates(lang as WebsiteLanguage, `person/${slug}`);
};

export default async function Page(props: { params: Promise<{ slug: string; lang: LanguageCode; currency: string }> }) {
	const { slug, lang, currency: currencySegment } = await props.params;
	const currency = toWebsiteCurrency(currencySegment);

	const [t, tCommon] = await Promise.all([getTranslations('website-journal'), getTranslations('website-common')]);

	const pageResult = await getJournalPersonPageData({
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
		<PersonProfile
			{...pageResult.data}
			articlesHeading={t('person.articles')}
			lang={lang}
			currency={currency}
			moreArticlesLabel={t('overview.more-articles')}
			videoLabel={t('badge.video')}
		/>
	);
}
