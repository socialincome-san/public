import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { RootDocument, rootViewport } from '@/app/root-document';
import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { CommunityBackstageProvider } from '@/components/community/community-backstage';
import { I18nContextProvider } from '@/lib/i18n/i18n-context-provider';
import { defaultLanguage, isWebsiteLanguage } from '@/lib/i18n/utils';
import { getMetadata } from '@/lib/utils/metadata';
import { getCurrentSessions } from '@/modules/auth/session.service';
import { notFound } from 'next/navigation';

import type { PropsWithChildren } from 'react';

export const viewport = rootViewport;

export const generateMetadata = async ({ params }: DefaultLayoutProps) => {
	const { lang } = await params;

	return getMetadata(isWebsiteLanguage(lang) ? lang : defaultLanguage, 'website-common');
};

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, region } = await params;
	if (!isWebsiteLanguage(lang)) {
		notFound();
	}
	const sessionsResult = await getCurrentSessions();
	const sessions = sessionsResult.success ? sessionsResult.data : [];

	return (
		<RootDocument lang={lang}>
			<I18nContextProvider>
				<CommunityBackstageProvider>
					<WebsiteAppShell sessions={sessions} lang={lang} region={region} scope="website">
						{children}
					</WebsiteAppShell>
				</CommunityBackstageProvider>
			</I18nContextProvider>
		</RootDocument>
	);
}
