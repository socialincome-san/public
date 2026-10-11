import { RootDocument, rootViewport } from '@/app/root-document';
import { PortalAppShell } from '@/components/app-shells/portal/app-shell';
import { defaultLanguage } from '@/lib/i18n/utils';
import { getMetadata } from '@/lib/utils/metadata';
import { requireSessions } from '@/server/session';
import type { ReactNode } from 'react';

export const viewport = rootViewport;

export const generateMetadata = () => getMetadata(defaultLanguage, 'website-common');

export default function PortalLayout({ children }: { children: ReactNode }) {
	return (
		<RootDocument lang={defaultLanguage}>
			<PortalShell>{children}</PortalShell>
		</RootDocument>
	);
}

const PortalShell = async ({ children }: { children: ReactNode }) => {
	const sessions = await requireSessions('user');

	return <PortalAppShell sessions={sessions}>{children}</PortalAppShell>;
};
