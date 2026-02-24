'use server';

import { getActorOrThrow } from '@/lib/firebase/current-account';
import { RecipientCreateInput, RecipientUpdateInput } from '@/lib/services/recipient/recipient.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

const PORTAL_RECIPIENTS_PATH = '/portal/management/recipients';
const PORTAL_PROGRAM_RECIPIENTS_PATH = '/portal/programs/[programId]/recipients';
const PARTNER_RECIPIENTS_PATH = '/partner-space/recipients';

export const createRecipientAction = async (recipient: RecipientCreateInput) => {
	const actor = await getActorOrThrow();

	const result = await services.recipient.create(actor, recipient);

	if (actor.kind === 'user') {
		revalidatePath(PORTAL_RECIPIENTS_PATH);
		revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');
	} else if (actor.kind === 'local-partner') {
		revalidatePath(PARTNER_RECIPIENTS_PATH);
	}

	return result;
};

export const updateRecipientAction = async (
	updateInput: RecipientUpdateInput,
	nextPaymentPhoneNumber: string | null,
) => {
	const actor = await getActorOrThrow();

	const result = await services.recipient.update(actor, updateInput, nextPaymentPhoneNumber);

	if (actor.kind === 'user') {
		revalidatePath(PORTAL_RECIPIENTS_PATH);
		revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');
	} else if (actor.kind === 'local-partner') {
		revalidatePath(PARTNER_RECIPIENTS_PATH);
	}

	return result;
};

export const deleteRecipientAction = async (recipientId: string) => {
	const actor = await getActorOrThrow();

	const result = await services.recipient.delete(actor, recipientId);

	if (actor.kind === 'user') {
		revalidatePath(PORTAL_RECIPIENTS_PATH);
		revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');
	} else if (actor.kind === 'local-partner') {
		revalidatePath(PARTNER_RECIPIENTS_PATH);
	}

	return result;
};

export const getRecipientAction = async (recipientId: string) => {
	const actor = await getActorOrThrow();
	return await services.recipient.get(actor, recipientId);
};

export const getRecipientOptions = async () => {
	const actor = await getActorOrThrow();

	if (actor.kind === 'user') {
		const programs = await services.program.getOptions(actor.session.id);
		const localPartner = await services.localPartner.getOptions();

		return {
			programs,
			localPartner,
		};
	}

	return {
		programs: { success: true, data: [] },
		localPartner: { success: true, data: [] },
	};
};

export const importRecipientsCsvAction = async (file: File) => {
	const actor = await getActorOrThrow();

	const result = await services.recipient.importCsv(actor, file);

	revalidatePath(PORTAL_RECIPIENTS_PATH);
	revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');

	return result;
};
