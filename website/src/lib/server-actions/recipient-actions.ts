'use server';

import { getActorOrThrow } from '@/lib/firebase/current-account';
import { LocalPartnerService } from '@/lib/services/local-partner/local-partner.service';
import { ProgramService } from '@/lib/services/program/program.service';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import { RecipientCreateInput, RecipientUpdateInput } from '@/lib/services/recipient/recipient.types';
import { revalidatePath } from 'next/cache';

const PORTAL_RECIPIENTS_PATH = '/portal/management/recipients';
const PORTAL_PROGRAM_RECIPIENTS_PATH = '/portal/programs/[programId]/recipients';
const PARTNER_RECIPIENTS_PATH = '/partner-space/recipients';

const recipientService = new RecipientService();
const programService = new ProgramService();
const localPartnerService = new LocalPartnerService();

export async function createRecipientAction(recipient: RecipientCreateInput) {
	const actor = await getActorOrThrow();

	const result = await recipientService.create(actor, recipient);

	if (actor.kind === 'user') {
		revalidatePath(PORTAL_RECIPIENTS_PATH);
		revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');
	} else if (actor.kind === 'local-partner') {
		revalidatePath(PARTNER_RECIPIENTS_PATH);
	}

	return result;
}

export async function updateRecipientAction(updateInput: RecipientUpdateInput, nextPaymentPhoneNumber: string | null) {
	const actor = await getActorOrThrow();

	const result = await recipientService.update(actor, updateInput, nextPaymentPhoneNumber);

	if (actor.kind === 'user') {
		revalidatePath(PORTAL_RECIPIENTS_PATH);
		revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');
	} else if (actor.kind === 'local-partner') {
		revalidatePath(PARTNER_RECIPIENTS_PATH);
	}

	return result;
}

export async function getRecipientAction(recipientId: string) {
	const actor = await getActorOrThrow();
	return await recipientService.get(actor, recipientId);
}

export async function getRecipientOptions() {
	const actor = await getActorOrThrow();

	if (actor.kind === 'user') {
		const programs = await programService.getOptions(actor.session.id);
		const localPartner = await localPartnerService.getOptions();

		return {
			programs,
			localPartner,
		};
	}

	return {
		programs: { success: true, data: [] },
		localPartner: { success: true, data: [] },
	};
}

export async function importRecipientsCsvAction(file: File) {
	const actor = await getActorOrThrow();

	const result = await recipientService.importCsv(actor, file);

	revalidatePath(PORTAL_RECIPIENTS_PATH);
	revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');

	return result;
}
