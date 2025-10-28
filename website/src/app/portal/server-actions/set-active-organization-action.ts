'use server';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { OrganizationService } from '@socialincome/shared/src/database/services/organization/organization.service';
import { revalidatePath } from 'next/cache';

export async function setActiveOrganizationAction(organizationId: string) {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new OrganizationService();
	const result = await service.setActiveOrganization(user.id, organizationId);

	if (!result.success) {
		throw new Error(result.error);
	}

	revalidatePath('/portal/account-settings');
}
