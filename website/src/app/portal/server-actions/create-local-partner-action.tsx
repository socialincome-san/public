'use server';

import { Prisma } from '.prisma/client';
import { LocalPartnerService } from '@socialincome/shared/src/database/services/local-partner/local-partner.service';
import { revalidatePath } from 'next/cache';

export async function createLocalPartnerAction(localPartner: Prisma.LocalPartnerCreateInput) {
	const localPartnerService = new LocalPartnerService();

	await localPartnerService.create(localPartner);

	revalidatePath('/portal/admin/local-partners');
}

export async function updateLocalPartnerAction(localPartner: Prisma.LocalPartnerUpdateInput) {
	const localPartnerService = new LocalPartnerService();

	await localPartnerService.update(localPartner);

	revalidatePath('/portal/admin/local-partners');
}

export async function getLocalPartnerAction(localPartnerId: string) {
	const localPartnerService = new LocalPartnerService();

	return await localPartnerService.get(localPartnerId);
}
