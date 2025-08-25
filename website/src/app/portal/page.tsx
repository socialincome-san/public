import { Breadcrumb } from '@/app/portal/components/breadcrumb/breadcrumb';
import { YourPrograms } from '@/app/portal/your-programs';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';

export default async function PortalPage() {
	const user = await getAuthenticatedUserOrRedirect();
	const breadcrumbLinks = [{ href: '/', label: 'Home' }];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />

			<div className="flex flex-wrap items-center gap-4 md:flex-row md:items-center">
				<h1 className="py-8 text-5xl">Welcome back, {user.firstName} 👋</h1>
			</div>

			<YourPrograms />
		</>
	);
}
