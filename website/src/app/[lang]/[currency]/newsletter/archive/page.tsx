import type { DefaultLayoutProps } from '@/app/[lang]/[currency]';
import {
	formatNewsletterDate,
	getNewsletterArchiveEntries,
} from '@/app/[lang]/[currency]/newsletter/archive/newsletter-archive';
import { getWebsiteBasePath, isWebsiteLanguage, parseCurrencySegment } from '@/lib/i18n/utils';
import { getMetadata, getWebsiteAlternates } from '@/lib/utils/metadata';
import { LinkList } from '@socialincome/design-system/data-display/link-list/link-list';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { PageIntro } from '@socialincome/design-system/layout/page-intro/page-intro';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const generateMetadata = async ({ params }: DefaultLayoutProps) => {
	const { lang } = await params;
	if (!isWebsiteLanguage(lang)) {
		return {};
	}

	const t = await getTranslations({ locale: lang, namespace: 'website-newsletter' });
	const title = t('archive.title');
	const description = t('archive.description');
	const metadata = await getMetadata(lang, 'website-common', {
		title,
		description,
		openGraph: { title, description },
		twitter: { title, description },
	});

	return { ...metadata, ...getWebsiteAlternates(lang, 'newsletter/archive') };
};

export default async function NewsletterArchivePage({ params }: DefaultLayoutProps) {
	const { lang, currency } = await params;
	const parsedCurrency = parseCurrencySegment(currency);
	if (!isWebsiteLanguage(lang) || !parsedCurrency) {
		notFound();
	}

	const [entries, t] = await Promise.all([
		getNewsletterArchiveEntries(),
		getTranslations({ locale: lang, namespace: 'website-newsletter' }),
	]);
	const basePath = getWebsiteBasePath(lang, parsedCurrency);

	return (
		<BlockWrapper marginTop="lg" marginBottom="lg">
			<div className="flex w-full flex-col gap-8">
				<PageIntro title={t('archive.title')} description={t('archive.description')} />
				<LinkList
					items={entries.map((entry) => ({
						label: entry.title,
						href: `${basePath}/newsletter/archive/${entry.id}`,
						tags: [formatNewsletterDate(entry.id, lang)],
					}))}
					initialCount={12}
					// The list fills in the number of newsletters
					showMoreLabel={t('archive.show-all', { count: '{count}' })}
					showLessLabel={t('archive.show-fewer')}
				/>
			</div>
		</BlockWrapper>
	);
}
