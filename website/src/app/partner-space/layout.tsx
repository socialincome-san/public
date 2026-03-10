import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';
import { getSessionsOrRedirect } from '@/lib/firebase/current-account';
import { defaultRegion } from '@/lib/i18n/utils';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function PartnerSpaceLayout({ children }: { children: ReactNode }) {
	const sessions = await getSessionsOrRedirect();
	if (!sessions.find((s) => s.type === 'local-partner')) {
		redirect('/login');
	}

	const sections = [
		{ href: '/partner-space/recipients', label: 'Recipients' },
		{ href: '/partner-space/candidates', label: 'Candidate Pool' },
		{ href: '/partner-space/profile', label: 'Profile' },
	];

	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: '/partner-space', label: 'Partner Space' },
	];

	return (
		<WebsiteAppShell sessions={sessions} lang="en" region={defaultRegion} scope="partner-space">
			<Breadcrumb links={breadcrumbLinks} />
			<h1 data-testid="welcome-message-partner-space" className="py-8 text-5xl">
				Partner Space
			</h1>
			<TabNavigation sections={sections} />
			<Card>{children}</Card>
		</WebsiteAppShell>
	);
}
