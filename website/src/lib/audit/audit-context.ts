import type { AuditContext, AuditSource } from './audit-types';

type SessionActor = {
	type: 'user' | 'local-partner' | 'contributor';
	id: string;
};

const sessionSources = {
	user: 'portal',
	'local-partner': 'partner-space',
	contributor: 'website',
} as const satisfies Record<SessionActor['type'], AuditSource>;

export const getSessionAuditContext = (session: SessionActor): AuditContext => ({
	actor: { type: session.type, id: session.id },
	source: sessionSources[session.type],
});
