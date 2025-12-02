import { UserPrograms } from '@/app/portal/user-programs';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { Suspense } from 'react';

export default function PortalPage() {
	return (
		<Suspense>
			<PortalDataLoader />
		</Suspense>
	);
}

async function PortalDataLoader() {
	const user = await getAuthenticatedUserOrRedirect();

	return (
		<>
			<div className="flex flex-wrap items-center gap-4 md:flex-row md:items-center">
				<h1 className="py-8 text-5xl">Welcome back, {user.firstName} 👋</h1>
			</div>

			<div className="space-y-16">
				<UserPrograms userId={user.id} />
			</div>
		</>
	);
}
