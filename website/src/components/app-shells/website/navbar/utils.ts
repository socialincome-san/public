import type { Session } from '@/modules/auth/auth.types';

export type Scope = 'website' | 'dashboard' | 'partner-space';

export const displaySession = (sessions: Session[], scope: Scope): Session | null => {
	if (scope === 'dashboard') {
		return sessions.find((s) => s.type === 'contributor') ?? null;
	}
	if (scope === 'partner-space') {
		return sessions.find((s) => s.type === 'local-partner') ?? null;
	}

	return sessions[0] ?? null;
};
