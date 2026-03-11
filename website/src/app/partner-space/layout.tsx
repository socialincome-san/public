import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';
import { ROUTES } from '@/lib/constants/routes';
import { getSessionsOrRedirect } from '@/lib/firebase/current-account';
import { defaultRegion } from '@/lib/i18n/utils';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function PartnerSpaceLayout({ children }: { children: ReactNode }) {
	const sessions = await getSessionsOrRedirect();
	if (!sessions.find((s) => s.type === 'local-partner')) {
		redirect(ROUTES.login);
	}

	const sections = [
		{ href: ROUTES.partnerSpaceRecipients, label: 'Recipients' },
		{ href: ROUTES.partnerSpaceCandidates, label: 'Candidate Pool' },
		{ href: ROUTES.partnerSpaceProfile, label: 'Profile' },
	];

	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: ROUTES.partnerSpace, label: 'Partner Space' },
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
