import type { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[currency]';
import { getPageMetadata } from '@/app/[lang]/[currency]/page-metadata';
import { getPublishedSlugParams } from '@/app/[lang]/[currency]/published-slug-params';
import { PersonProfile } from '@/components/storyblok/journal/person-profile';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { toWebsiteCurrency } from '@/lib/i18n/utils';
import { getBioSegments } from '@/lib/storyblok/person-bio';
import { LanguageCode } from '@/lib/types/language';
import { getTodayMs } from '@/lib/utils/today';
import { getJournalPersonPageData } from '@/modules/journal/journal.cache';
import { getPerson } from '@/modules/storyblok-content/storyblok-content.cache';
import { notFound } from 'next/navigation';

export const generateStaticParams = () => getPublishedSlugParams('person');

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug) => {
	const { lang, slug } = await params;

	const personResult = await getPerson(slug, lang);

	return getPageMetadata(
		lang as WebsiteLanguage,
		`person/${slug}`,
		personResult.success
			? {
					title: personResult.data.content.fullName,
					// The bio is rich text, or the plain string of older stories
					description: getBioSegments(personResult.data.content.bio)
						.map((segment) => segment.text)
						.join(''),
				}
			: {},
	);
};

export default async function Page(props: { params: Promise<{ slug: string; lang: LanguageCode; currency: string }> }) {
	const { slug, lang, currency: currencySegment } = await props.params;
	const currency = toWebsiteCurrency(currencySegment);

	const [pageResult, todayMs] = await Promise.all([getJournalPersonPageData({ lang, currency, slug }), getTodayMs()]);

	if (!pageResult.success) {
		notFound();
	}

	return <PersonProfile {...pageResult.data} lang={lang} currency={currency} todayMs={todayMs} />;
}
