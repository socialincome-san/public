import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { CommunityBackstageProvider } from '@/components/community/community-backstage';
import { I18nContextProvider } from '@/lib/i18n/i18n-context-provider';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getCurrentSessions } from '@/modules/auth/session.service';

import type { PropsWithChildren } from 'react';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, region } = await params;
	const sessionsResult = await getCurrentSessions();
	const sessions = sessionsResult.success ? sessionsResult.data : [];

	return (
		<I18nContextProvider>
			<CommunityBackstageProvider>
				<WebsiteAppShell sessions={sessions} lang={lang as WebsiteLanguage} region={region} scope="website">
					{children}
				</WebsiteAppShell>
			</CommunityBackstageProvider>
		</I18nContextProvider>
	);
}
