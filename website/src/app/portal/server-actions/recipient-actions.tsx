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
		revalidatePath('/portal/programs/[slug]/recipients', 'page');
	return res;
}

export async function updateRecipientAction(recipient: RecipientUpdateInput) {
	const recipientService = new RecipientService();

	const res = await recipientService.update(recipient);
	revalidatePath('/portal/management/recipients');
		revalidatePath('/portal/programs/[slug]/recipients', 'page');
	return res;
}

export async function getRecipientAction(recipientId: string) {
	const recipientService = new RecipientService();

	return await recipientService.get(recipientId);
}

export async function getRecipientOptions(userId: string) {
	const programService = new ProgramService();
	const programs = await programService.getOptions(userId);
	const localPartnerService = new LocalPartnerService();
	const localPartner = await localPartnerService.getOptions(userId);
	return {
		programs,
		localPartner,
	};
}
