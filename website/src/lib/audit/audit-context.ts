import type { AuditContext } from './audit-types';

type SessionActor = {
	type: 'user' | 'local-partner' | 'contributor';
	id: string;
	name?: string;
	firstName?: string | null;
	lastName?: string | null;
};

const sessionSources = {
	user: 'portal',
	'local-partner': 'partner-space',
	contributor: 'website',
} as const satisfies Record<SessionActor['type'], AuditContext['source']>;

export const getSessionAuditContext = (session: SessionActor): AuditContext => ({
	actor: {
		type: session.type,
		id: session.id,
		name: session.name ?? ([session.firstName, session.lastName].filter(Boolean).join(' ') || null),
	},
	source: sessionSources[session.type],
});
