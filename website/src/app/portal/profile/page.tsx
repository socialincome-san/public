import { OrganizationSwitcher } from '@/app/portal/profile/organization-switcher';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { setActiveOrganizationAction } from '@/lib/server-actions/set-active-organization-action';

export default async function ProfilePage() {
	const user = await getAuthenticatedUserOrRedirect();

	return <OrganizationSwitcher user={user} setActiveOrganizationAction={setActiveOrganizationAction} />;
}
