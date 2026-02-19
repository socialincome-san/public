import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { getCurrentSessionsOrRedirect } from '@/lib/firebase/current-account';
import { defaultRegion } from '@/lib/i18n/utils';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function PartnerSpaceLayout({ children }: { children: ReactNode }) {
	const sessions = await getCurrentSessionsOrRedirect();
	if (!sessions.find((s) => s.type === 'local-partner')) {
		redirect('/login');
	}

	return (
		<WebsiteAppShell sessions={sessions} lang="en" region={defaultRegion} scope="partner-space">
			{children}
		</WebsiteAppShell>
	);
}
