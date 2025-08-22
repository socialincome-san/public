import { AppShell } from '@/app/portal/components/app-shell';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

const ENABLE_PORTAL = process.env.NEXT_PUBLIC_FEATURE_ENABLE_PORTAL === 'true';

export default async function PortalLayout({ children }: { children: ReactNode }) {
	if (!ENABLE_PORTAL) notFound();
	await getAuthenticatedUserOrRedirect();
	return <AppShell>{children}</AppShell>;
}
