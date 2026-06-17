import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { getCurrentSessions } from '@/lib/firebase/current-account';
import { I18nContextProvider } from '@/lib/i18n/i18n-context-provider';
import { WebsiteLanguage } from '@/lib/i18n/utils';

import type { PropsWithChildren } from 'react';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, region } = await params;
	const sessions = await getCurrentSessions();

	return (
		<I18nContextProvider>
			<WebsiteAppShell sessions={sessions} lang={lang as WebsiteLanguage} region={region} scope="website">
				{children}
			</WebsiteAppShell>
		</I18nContextProvider>
	);
}
