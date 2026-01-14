import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';
import { getAuthenticatedLocalPartnerOrRedirect } from '@/lib/firebase/current-local-partner';
import type { ReactNode } from 'react';

export default async function PartnerSpaceLayout({ children }: { children: ReactNode }) {
	const partner = await getAuthenticatedLocalPartnerOrRedirect();

	const sections = [
		{ href: '/partner-space/recipients', label: 'Recipients' },
		{ href: '/partner-space/candidates', label: 'Candidate Pool' },
	];

	return (
		<WebsiteAppShell session={partner} lang="en">
			<h1 className="py-8 text-5xl">Partner Space</h1>
			<TabNavigation sections={sections} />
			<Card>{children}</Card>
		</WebsiteAppShell>
	);
}
