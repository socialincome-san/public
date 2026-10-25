import type { DefaultLayoutProps } from '@/app/[lang]/[currency]';
import {
	formatNewsletterDate,
	getNewsletterArchiveEntries,
} from '@/app/[lang]/[currency]/newsletter/archive/newsletter-archive';
import { getWebsiteBasePath, isWebsiteLanguage, parseCurrencySegment } from '@/lib/i18n/utils';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const generateMetadata = async ({ params }: DefaultLayoutProps) => {
	const { lang } = await params;
	if (!isWebsiteLanguage(lang)) {
		return {};
	}

	const t = await getTranslations({ locale: lang, namespace: 'website-newsletter' });
	const title = t('archive.title');
	const description = t('archive.description');

	return { title, description, openGraph: { title, description } };
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
			<section className="max-w-content mx-auto">
				<h1 className="text-foreground mb-4 text-4xl font-medium">{t('archive.title')}</h1>
				<p className="text-muted-foreground mb-8 text-lg">{t('archive.description')}</p>
				<ul className="divide-border divide-y">
					{entries.map((entry) => (
						<li key={entry.id}>
							<Link
								href={`${basePath}/newsletter/archive/${entry.id}`}
								className="text-foreground hover:text-primary flex flex-col gap-2 py-5 transition-colors sm:flex-row sm:items-center sm:justify-between"
							>
								<span className="text-lg font-medium">{entry.title}</span>
								<span className="text-muted-foreground text-sm">{formatNewsletterDate(entry.id, lang)}</span>
							</Link>
						</li>
					))}
				</ul>
			</section>
		</BlockWrapper>
	);
}
