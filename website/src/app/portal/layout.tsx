import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

const ENABLE_PORTAL = process.env.NEXT_PUBLIC_FEATURE_ENABLE_PORTAL === 'true';

export default async function PortalLayout({ children }: { children: ReactNode }) {
	if (!ENABLE_PORTAL) notFound();

	return <>{children}</>;
}
