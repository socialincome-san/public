import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { CommunityBackstageProvider } from '@/components/community/community-backstage';
import { I18nContextProvider } from '@/lib/i18n/i18n-context-provider';
import { TIME_ZONE } from '@/lib/i18n/request';
import { defaultLanguage, isWebsiteLanguage } from '@/lib/i18n/utils';
import { getCurrentSessions } from '@/modules/auth/session.service';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import type { PropsWithChildren } from 'react';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, region } = await params;
	const language = isWebsiteLanguage(lang) ? lang : defaultLanguage;
	const sessionsResult = await getCurrentSessions();
	const sessions = sessionsResult.success ? sessionsResult.data : [];

	return (
		<NextIntlClientProvider locale={language} messages={await getMessages({ locale: language })} timeZone={TIME_ZONE}>
			<I18nContextProvider>
				<CommunityBackstageProvider>
					<WebsiteAppShell sessions={sessions} lang={language} region={region} scope="website">
						{children}
					</WebsiteAppShell>
				</CommunityBackstageProvider>
			</I18nContextProvider>
		</NextIntlClientProvider>
	);
}
