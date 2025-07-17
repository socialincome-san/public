import { UserContextProvider } from '@/app/portal/providers/UserContextProvider';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default function PortalLayout({ children }: { children: ReactNode }) {
	const isEnabled = process.env.NEXT_PUBLIC_FEATURE_ENABLE_PORTAL === 'true';

	if (!isEnabled) {
		notFound();
	}

	return <UserContextProvider redirectToLogin>{children}</UserContextProvider>;
}
