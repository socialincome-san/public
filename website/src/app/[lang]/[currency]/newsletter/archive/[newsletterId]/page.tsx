import {
	formatNewsletterDate,
	getNewsletterArchiveEntry,
} from '@/app/[lang]/[currency]/newsletter/archive/newsletter-archive';
import { getWebsiteBasePath, isWebsiteLanguage, parseCurrencySegment } from '@/lib/i18n/utils';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ newsletterId: string; lang: string; currency: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
	const { lang, newsletterId } = await params;
	const entry = await getNewsletterArchiveEntry(newsletterId);
	if (!entry || !isWebsiteLanguage(lang)) {
		return {};
	}

	const t = await getTranslations({ locale: lang, namespace: 'website-newsletter' });
	const description = t('archive.item-description', { date: formatNewsletterDate(entry.id, lang) });

	return { title: entry.title, description, openGraph: { title: entry.title, description } };
};

export default async function NewsletterArchiveDetailPage({ params }: Props) {
	const { lang, currency, newsletterId } = await params;
	const parsedCurrency = parseCurrencySegment(currency);
	const entry = await getNewsletterArchiveEntry(newsletterId);
	if (!entry || !isWebsiteLanguage(lang) || !parsedCurrency) {
		notFound();
	}

	const t = await getTranslations({ locale: lang, namespace: 'website-newsletter' });
	const basePath = getWebsiteBasePath(lang, parsedCurrency);
	const date = formatNewsletterDate(entry.id, lang);

	return (
		<BlockWrapper marginTop="lg" marginBottom="lg">
			<section className="max-w-content mx-auto">
				<Link href={`${basePath}/newsletter/archive`} className="text-primary mb-6 inline-block hover:underline">
					{t('archive.back')}
				</Link>
				<h1 className="text-foreground mb-2 text-4xl font-medium">{entry.title}</h1>
				<p className="text-muted-foreground mb-6">{date}</p>
				<iframe
					src={`${basePath}/newsletter/archive/${entry.id}/content`}
					title={entry.title}
					sandbox="allow-popups allow-popups-to-escape-sandbox"
					className="h-[80vh] min-h-[40rem] w-full rounded-xl border-0"
				/>
			</section>
		</BlockWrapper>
	);
}
