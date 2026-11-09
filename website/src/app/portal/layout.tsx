import { RootDocument, rootViewport } from '@/app/root-document';
import { PortalAppShell } from '@/components/app-shells/portal/app-shell';
import { getPortalLanguage } from '@/lib/i18n/utils';
import { getMetadata } from '@/lib/utils/metadata';
import { requireSessions } from '@/server/session';
import { getLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

export const viewport = rootViewport;

export const generateMetadata = async () => getMetadata(getPortalLanguage(await getLocale()), 'website-common');

export default async function PortalLayout({ children }: { children: ReactNode }) {
	return (
		<RootDocument lang={await getLocale()} messageScope="portal">
			<PortalShell>{children}</PortalShell>
		</RootDocument>
	);
}

const PortalShell = async ({ children }: { children: ReactNode }) => {
	const sessions = await requireSessions('user');

	return <PortalAppShell sessions={sessions}>{children}</PortalAppShell>;
};
