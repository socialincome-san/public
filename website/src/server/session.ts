import type { Session } from '@/modules/auth/auth.types';
import { getCurrentSessions, getSessionByType } from '@/modules/auth/session.service';
import type { UserSession } from '@/modules/users/user.types';
import { notFound, redirect } from 'next/navigation';

export const requireSession = async <T extends Session['type']>(type: T): Promise<Extract<Session, { type: T }>> => {
	const result = await getSessionByType(type);
	if (!result.success) {
		redirect('/login');
	}

	return result.data;
};

export const requireAdmin = async (): Promise<UserSession> => {
	const user = await requireSession('user');
	if (user.role !== 'admin') {
		notFound();
	}

	return user;
};

export const requireSessions = async (type: Session['type'], loginPath = '/login'): Promise<Session[]> => {
	const result = await getCurrentSessions();
	const sessions = result.success ? result.data : [];
	if (!sessions.some((session) => session.type === type)) {
		redirect(loginPath);
	}

	return sessions;
};
