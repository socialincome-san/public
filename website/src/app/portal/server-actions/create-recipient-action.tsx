'use server';

import { LocalPartnerService } from '@socialincome/shared/src/database/services/local-partner/local-partner.service';
import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';
import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';
import {
	RecipientCreateInput,
	RecipientUpdateInput,
} from '@socialincome/shared/src/database/services/recipient/recipient.types';
import { revalidatePath } from 'next/cache';

export async function createRecipientAction(recipient: RecipientCreateInput) {
	const recipientService = new RecipientService();

	const res = await recipientService.create(recipient);
	revalidatePath('/portal/management/recipients');
	return res;
}

export async function updateRecipientAction(recipient: RecipientUpdateInput) {
	const recipientService = new RecipientService();

	const res = await recipientService.update(recipient);
	revalidatePath('/portal/management/recipients');
	return res;
}

export async function getRecipientAction(recipientId: string) {
	const recipientService = new RecipientService();

	return await recipientService.get(recipientId);
}

export async function getRecipientOptions(userId: string) {
	// TODO: add payment service
	const programService = new ProgramService();
	// TODO: add getter in service
	const programs = await programService.getProgramWalletView(userId);
	const localPartnerService = new LocalPartnerService();
	// TODO: add getter in service
	const localPartner = await localPartnerService.getTableView(userId);
	return {
		programs,
		localPartner,
	};
	// LocalPartner
}
