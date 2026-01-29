import { getCurrentSession } from '@/lib/firebase/current-account';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function MyAccountPage() {
	const session = await getCurrentSession();

	const sessionType = session?.type;

	if (sessionType === 'contributor') {
		redirect('/dashboard/contributions');
	}

	if (sessionType === 'user') {
		redirect('/portal');
	}

	if (sessionType === 'local-partner') {
		redirect('/partner-space/recipients');
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
			<p>No account found.</p>

			<Link href="/" className="underline">
				Return home
			</Link>
		</div>
	);
}
