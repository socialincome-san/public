import { PortalAppShell } from '@/components/app-shells/portal/app-shell';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

const ENABLE_PORTAL = process.env.NEXT_PUBLIC_FEATURE_ENABLE_PORTAL === 'true';

export default async function PortalLayout({ children }: { children: ReactNode }) {
	if (!ENABLE_PORTAL) notFound();

	const user = await getAuthenticatedUserOrRedirect();

	return <PortalAppShell user={user}>{children}</PortalAppShell>;
}
