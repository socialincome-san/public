import { YourPrograms } from '@/app/portal/components/custom/your-programs';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';

export default async function PortalPage() {
	const user = await getAuthenticatedUserOrRedirect();

	return (
		<div>
			<h1 className="text-lg">Welcome back, {user.firstName} 👋</h1>
			<YourPrograms />
		</div>
	);
}
