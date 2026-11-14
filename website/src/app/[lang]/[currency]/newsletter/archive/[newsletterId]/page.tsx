import {
	formatNewsletterDate,
	getNewsletterArchiveEntries,
	getNewsletterArchiveEntry,
} from '@/app/[lang]/[currency]/newsletter/archive/newsletter-archive';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { getWebsiteBasePath, isWebsiteLanguage, parseCurrencySegment } from '@/lib/i18n/utils';
import { getMetadata, getWebsiteAlternates } from '@/lib/utils/metadata';
import { Embed } from '@socialincome/design-system/data-display/embed/embed';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { PageIntro } from '@socialincome/design-system/layout/page-intro/page-intro';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ newsletterId: string; lang: string; currency: string }> };

export const generateStaticParams = async () =>
	(await getNewsletterArchiveEntries()).map(({ id }) => ({ newsletterId: id }));

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
	const { lang, newsletterId } = await params;
	const entry = await getNewsletterArchiveEntry(newsletterId);
	if (!entry || !isWebsiteLanguage(lang)) {
		return {};
	}

	const t = await getTranslations({ locale: lang, namespace: 'website-newsletter' });
	const title = entry.title;
	const description = t('archive.item-description', { date: formatNewsletterDate(entry.id, lang) });
	const metadata = await getMetadata(lang, 'website-common', {
		title,
		description,
		openGraph: { title, description },
		twitter: { title, description },
	});

	return { ...metadata, ...getWebsiteAlternates(lang, `newsletter/archive/${entry.id}`) };
};

export default async function NewsletterArchiveDetailPage({ params }: Props) {
	const { lang, currency, newsletterId } = await params;
	const parsedCurrency = parseCurrencySegment(currency);
	const entry = await getNewsletterArchiveEntry(newsletterId);
	if (!entry || !isWebsiteLanguage(lang) || !parsedCurrency) {
		notFound();
	}

	const [t, tCommon] = await Promise.all([
		getTranslations({ locale: lang, namespace: 'website-newsletter' }),
		getTranslations({ locale: lang, namespace: 'website-common' }),
	]);
	const basePath = getWebsiteBasePath(lang, parsedCurrency);
	const archivePath = `${basePath}/newsletter/archive`;
	const entryPath = `${archivePath}/${entry.id}`;

	return (
		<div className="flex flex-col gap-8 py-8">
			<Breadcrumb
				layout="section"
				links={[
					{ label: tCommon('breadcrumb.home'), href: basePath },
					{ label: t('archive.title'), href: archivePath },
					{ label: entry.title, href: entryPath },
				]}
			/>
			<BlockWrapper marginTop="none" marginBottom="lg">
				<div className="flex w-full flex-col gap-8">
					<PageIntro title={entry.title} description={formatNewsletterDate(entry.id, lang)} />
					<Embed src={`${entryPath}/content`} title={entry.title} height={900} staticContent />
				</div>
			</BlockWrapper>
		</div>
	);
}
