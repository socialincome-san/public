import { getCurrentSessions } from '@/lib/firebase/current-account';
import { redirect } from 'next/navigation';

export default async function AfterLoginPage() {
	const sessions = await getCurrentSessions();

	if (sessions.length === 0) {
		redirect('/');
	}

	if (sessions.length === 1) {
		const session = sessions[0];
		if (session.type === 'contributor') {
			redirect('/dashboard/contributions');
		}
		if (session.type === 'user') {
			redirect('/portal');
		}
		if (session.type === 'local-partner') {
			redirect('/partner-space/recipients');
		}
	}

	if (sessions.length > 1) {
		redirect('/portal');
	}

	redirect('/');
}
