import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { getCurrentSessions } from '@/lib/firebase/current-account';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, region } = await params;

	const sessions = await getCurrentSessions();

	return (
		<WebsiteAppShell sessions={sessions} lang={lang as WebsiteLanguage} region={region} scope="website">
			{children}
		</WebsiteAppShell>
	);
}
