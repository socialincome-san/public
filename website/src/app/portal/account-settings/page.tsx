import { OrganizationSwitcher } from '@/app/portal/account-settings/organization-switcher';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { setActiveOrganizationAction } from '@/lib/server-actions/set-active-organization-action';

export default async function AccountSettingsPage() {
	const user = await getAuthenticatedUserOrRedirect();

	return (
		<>
			<div className="flex flex-wrap items-center gap-4 md:flex-row md:items-center">
				<h1 className="py-8 text-5xl">Account Settings</h1>
			</div>
			<OrganizationSwitcher user={user} setActiveOrganizationAction={setActiveOrganizationAction} />
		</>
	);
}
