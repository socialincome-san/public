import { UserPrograms } from '@/app/portal/user-programs';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { ROUTES } from '@/lib/constants/routes';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { Suspense } from 'react';

export default function PortalPage() {
	return (
		<Suspense>
			<PortalDataLoader />
		</Suspense>
	);
}

const PortalDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();

	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: ROUTES.portal, label: 'Portal' },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<div className="flex flex-wrap items-center gap-4 md:flex-row md:items-center">
				<h1 data-testid="welcome-message-portal" className="py-8 text-5xl">
					Welcome back {user.firstName} 👋
				</h1>
			</div>

			<div className="space-y-16">
				<UserPrograms userId={user.id} />
			</div>
		</>
	);
};
