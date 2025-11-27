'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { LocalPartnerService } from '@/lib/services/local-partner/local-partner.service';
import { ProgramService } from '@/lib/services/program/program.service';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import { RecipientCreateInput, RecipientUpdateInput } from '@/lib/services/recipient/recipient.types';
import { revalidatePath } from 'next/cache';

export async function createRecipientAction(recipient: RecipientCreateInput) {
	const user = await getAuthenticatedUserOrThrow();
	const recipientService = new RecipientService();

	const res = await recipientService.create(user.id, recipient);
	revalidatePath('/portal/management/recipients');
	revalidatePath('/portal/programs/[programId]/recipients', 'page');
	return res;
}

export async function updateRecipientAction(recipient: RecipientUpdateInput) {
	const user = await getAuthenticatedUserOrThrow();
	const recipientService = new RecipientService();

	const res = await recipientService.update(user.id, recipient);
	revalidatePath('/portal/management/recipients');
	revalidatePath('/portal/programs/[programId]/recipients', 'page');
	return res;
}

export async function getRecipientAction(recipientId: string) {
	const user = await getAuthenticatedUserOrThrow();
	const recipientService = new RecipientService();

	return await recipientService.get(user.id, recipientId);
}

export async function getRecipientOptions() {
	const user = await getAuthenticatedUserOrThrow();

	const programService = new ProgramService();
	const programs = await programService.getOptions(user.id);

	const localPartnerService = new LocalPartnerService();
	const localPartner = await localPartnerService.getOptions();

	return {
		programs,
		localPartner,
	};
}
