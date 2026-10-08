import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { RootDocument, rootViewport } from '@/app/root-document';
import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { CommunityBackstageProvider } from '@/components/community/community-backstage';
import {
	defaultLanguage,
	isWebsiteLanguage,
	mainWebsiteLanguages,
	websiteRegions,
	type WebsiteLanguage,
} from '@/lib/i18n/utils';
import { WebsiteRegionProvider } from '@/lib/i18n/website-currency';
import { getMetadata } from '@/lib/utils/metadata';
import { getCurrentSessions } from '@/modules/auth/session.service';
import { notFound } from 'next/navigation';

import type { PropsWithChildren } from 'react';

export const viewport = rootViewport;

export const generateStaticParams = () =>
	mainWebsiteLanguages.flatMap((lang) => websiteRegions.map((region) => ({ lang, region })));

export const generateMetadata = async ({ params }: DefaultLayoutProps) => {
	const { lang } = await params;

	return getMetadata(isWebsiteLanguage(lang) ? lang : defaultLanguage, 'website-common');
};

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, region } = await params;
	if (!isWebsiteLanguage(lang)) {
		notFound();
	}

	return (
		<RootDocument lang={lang}>
			<WebsiteShell lang={lang} region={region}>
				{children}
			</WebsiteShell>
		</RootDocument>
	);
}

const WebsiteShell = ({ lang, region, children }: PropsWithChildren<{ lang: WebsiteLanguage; region: string }>) => {
	// Not awaited: only the navbar's session slots suspend on it, so the rest of the shell needs no request data.
	const sessions = getCurrentSessions().then((result) => (result.success ? result.data : []));

	return (
		<WebsiteRegionProvider region={region}>
			<CommunityBackstageProvider>
				<WebsiteAppShell sessions={sessions} lang={lang} region={region} scope="website">
					{children}
				</WebsiteAppShell>
			</CommunityBackstageProvider>
		</WebsiteRegionProvider>
	);
};
