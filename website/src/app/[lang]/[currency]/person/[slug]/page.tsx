import type { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[currency]';
import { getPublishedSlugParams } from '@/app/[lang]/[currency]/published-slug-params';
import { PersonProfile } from '@/components/storyblok/journal/person-profile';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { toWebsiteCurrency } from '@/lib/i18n/utils';
import { LanguageCode } from '@/lib/types/language';
import { getWebsiteAlternates } from '@/lib/utils/metadata';
import { getTodayMs } from '@/lib/utils/today';
import { getJournalPersonPageData } from '@/modules/journal/journal.cache';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const generateStaticParams = () => getPublishedSlugParams('person');

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug) => {
	const { lang, slug } = await params;

	return getWebsiteAlternates(lang as WebsiteLanguage, `person/${slug}`);
};

export default async function Page(props: { params: Promise<{ slug: string; lang: LanguageCode; currency: string }> }) {
	const { slug, lang, currency: currencySegment } = await props.params;
	const currency = toWebsiteCurrency(currencySegment);

	const [t, tCommon, todayMs] = await Promise.all([
		getTranslations('website-journal'),
		getTranslations('website-common'),
		getTodayMs(),
	]);

	const pageResult = await getJournalPersonPageData({
		lang,
		currency,
		slug,
		parentLabel: t('person.breadcrumb'),
		homeLabel: tCommon('breadcrumb.home'),
	});

	if (!pageResult.success) {
		notFound();
	}

	return <PersonProfile {...pageResult.data} lang={lang} currency={currency} todayMs={todayMs} />;
}
