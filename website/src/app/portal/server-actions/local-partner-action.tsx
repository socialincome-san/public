'use server';

import { LocalPartnerService } from '@socialincome/shared/src/database/services/local-partner/local-partner.service';
import {
	LocalPartnerCreateInput,
	LocalPartnerUpdateInput,
} from '@socialincome/shared/src/database/services/local-partner/local-partner.types';
import { revalidatePath } from 'next/cache';

export async function createLocalPartnerAction(localPartner: LocalPartnerCreateInput) {
	const localPartnerService = new LocalPartnerService();

	const res = await localPartnerService.create(localPartner);
	revalidatePath('/portal/admin/local-partners');
	return res;
}

export async function updateLocalPartnerAction(localPartner: LocalPartnerUpdateInput) {
	const localPartnerService = new LocalPartnerService();

	const res = await localPartnerService.update(localPartner);
	revalidatePath('/portal/admin/local-partners');
	return res;
}

export async function getLocalPartnerAction(localPartnerId: string) {
	const localPartnerService = new LocalPartnerService();

	return await localPartnerService.get(localPartnerId);
}
