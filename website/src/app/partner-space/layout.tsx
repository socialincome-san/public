import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { getAuthenticatedLocalPartnerOrRedirect } from '@/lib/firebase/current-local-partner';
import { defaultRegion } from '@/lib/i18n/utils';
import type { ReactNode } from 'react';

export default async function PartnerSpaceLayout({ children }: { children: ReactNode }) {
	const partner = await getAuthenticatedLocalPartnerOrRedirect();

	return (
		<WebsiteAppShell session={partner} lang="en" region={defaultRegion} scope="partner-space">
			{children}
		</WebsiteAppShell>
	);
}
