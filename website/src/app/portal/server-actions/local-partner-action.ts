'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { LocalPartnerService } from '@socialincome/shared/src/database/services/local-partner/local-partner.service';
import {
	LocalPartnerCreateInput,
	LocalPartnerUpdateInput,
} from '@socialincome/shared/src/database/services/local-partner/local-partner.types';
import { revalidatePath } from 'next/cache';

export async function createLocalPartnerAction(localPartner: LocalPartnerCreateInput) {
	const user = await getAuthenticatedUserOrThrow();

	const localPartnerService = new LocalPartnerService();
	const res = await localPartnerService.create(user.id, localPartner);

	revalidatePath('/portal/admin/local-partners');
	return res;
}

export async function updateLocalPartnerAction(localPartner: LocalPartnerUpdateInput) {
	const user = await getAuthenticatedUserOrThrow();

	const localPartnerService = new LocalPartnerService();
	const res = await localPartnerService.update(user.id, localPartner);

	revalidatePath('/portal/admin/local-partners');
	return res;
}

export async function getLocalPartnerAction(localPartnerId: string) {
	const user = await getAuthenticatedUserOrThrow();

	const localPartnerService = new LocalPartnerService();
	return await localPartnerService.get(user.id, localPartnerId);
}
