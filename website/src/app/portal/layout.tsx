import { RootDocument } from '@/app/root-document';
import { PortalAppShell } from '@/components/app-shells/portal/app-shell';
import { getSessionsOrRedirect } from '@/lib/firebase/current-account';
import { defaultLanguage } from '@/lib/i18n/utils';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function PortalLayout({ children }: { children: ReactNode }) {
	const sessions = await getSessionsOrRedirect();
	if (!sessions.some((s) => s.type === 'user')) {
		redirect('/login');
	}

	return (
		<RootDocument lang={defaultLanguage}>
			<PortalAppShell sessions={sessions}>{children}</PortalAppShell>
		</RootDocument>
	);
}
