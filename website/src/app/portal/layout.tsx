import { RootDocument, rootViewport } from '@/app/root-document';
import { PortalAppShell } from '@/components/app-shells/portal/app-shell';
import { getPortalLanguage } from '@/lib/i18n/utils';
import { getMetadata } from '@/lib/utils/metadata';
import type { Session } from '@/modules/auth/auth.types';
import { requireSession, requireSessions } from '@/server/session';
import type { ReactNode } from 'react';

export const viewport = rootViewport;

export const generateMetadata = async () => {
	const user = await requireSession('user');

	return getMetadata(getPortalLanguage(user.language), 'website-common');
};

export default async function PortalLayout({ children }: { children: ReactNode }) {
	const sessions = await requireSessions('user');
	const user = sessions.find(isUserSession);
	const language = getPortalLanguage(user?.language);

	return (
		<RootDocument lang={language} messageScope="portal">
			<PortalAppShell sessions={sessions}>{children}</PortalAppShell>
		</RootDocument>
	);
}

const isUserSession = (session: Session): session is Extract<Session, { type: 'user' }> => session.type === 'user';
