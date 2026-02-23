import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { getCurrentSessionsOrRedirect } from '@/lib/firebase/current-account';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { DefaultLayoutProps } from '..';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, region } = await params;
	const sessions = await getCurrentSessionsOrRedirect();
	if (!sessions.find((s) => s.type === 'contributor')) {
		redirect('/login');
	}

	return (
		<WebsiteAppShell sessions={sessions} lang={lang as WebsiteLanguage} region={region} scope="dashboard">
			<div className="container mx-auto">{children}</div>
		</WebsiteAppShell>
	);
}
