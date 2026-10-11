import { DefaultLayoutProps } from '@/app/[lang]/[currency]';
import { RootDocument, rootViewport } from '@/app/root-document';
import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { CommunityBackstageProvider } from '@/components/community/community-backstage';
import {
	defaultLanguage,
	isWebsiteLanguage,
	mainWebsiteLanguages,
	parseCurrencySegment,
	toCurrencySegment,
	websiteCurrencies,
	type WebsiteCurrency,
	type WebsiteLanguage,
} from '@/lib/i18n/utils';
import { WebsiteCurrencyProvider } from '@/lib/i18n/website-currency';
import { getMetadata } from '@/lib/utils/metadata';
import { getCurrentSessions } from '@/modules/auth/session.service';
import { notFound } from 'next/navigation';

import type { PropsWithChildren } from 'react';

export const viewport = rootViewport;

export const generateStaticParams = () =>
	mainWebsiteLanguages.flatMap((lang) =>
		websiteCurrencies.map((currency) => ({ lang, currency: toCurrencySegment(currency) })),
	);

export const generateMetadata = async ({ params }: DefaultLayoutProps) => {
	const { lang } = await params;

	return getMetadata(isWebsiteLanguage(lang) ? lang : defaultLanguage, 'website-common');
};

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, currency: currencySegment } = await params;
	const currency = parseCurrencySegment(currencySegment);
	if (!isWebsiteLanguage(lang) || !currency) {
		notFound();
	}

	return (
		<RootDocument lang={lang}>
			<WebsiteShell lang={lang} currency={currency}>
				{children}
			</WebsiteShell>
		</RootDocument>
	);
}

const WebsiteShell = ({
	lang,
	currency,
	children,
}: PropsWithChildren<{ lang: WebsiteLanguage; currency: WebsiteCurrency }>) => {
	// Not awaited: only the navbar's session slots suspend on it, so the rest of the shell needs no request data.
	const sessions = getCurrentSessions().then((result) => (result.success ? result.data : []));

	return (
		<WebsiteCurrencyProvider currency={currency}>
			<CommunityBackstageProvider>
				<WebsiteAppShell sessions={sessions} lang={lang} currency={currency} scope="website">
					{children}
				</WebsiteAppShell>
			</CommunityBackstageProvider>
		</WebsiteCurrencyProvider>
	);
};
