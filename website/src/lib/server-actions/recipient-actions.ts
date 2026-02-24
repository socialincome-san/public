'use server';

import { getSessionByTypeOrThrow, type Session } from '@/lib/firebase/current-account';
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

export const createRecipientAction = async (
	recipient: RecipientCreateInput,
	sessionType: Session['type'] = 'user',
) => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await recipientService.create(session, recipient);
	if (session.type === 'user') {
		revalidatePath(PORTAL_RECIPIENTS_PATH);
		revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_RECIPIENTS_PATH);
	}
	return result;
};

export const updateRecipientAction = async (
	updateInput: RecipientUpdateInput,
	nextPaymentPhoneNumber: string | null,
	sessionType: Session['type'] = 'user',
) => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await recipientService.update(session, updateInput, nextPaymentPhoneNumber);
	if (session.type === 'user') {
		revalidatePath(PORTAL_RECIPIENTS_PATH);
		revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_RECIPIENTS_PATH);
	}
	return result;
};

export const deleteRecipientAction = async (recipientId: string, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await recipientService.delete(session, recipientId);
	if (session.type === 'user') {
		revalidatePath(PORTAL_RECIPIENTS_PATH);
		revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_RECIPIENTS_PATH);
	}
	return result;
};

export const getRecipientAction = async (recipientId: string, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	return await recipientService.get(session, recipientId);
};

export const getRecipientOptions = async (sessionType: Session['type'] = 'user') => {
	if (sessionType !== 'user') {
		return {
			programs: { success: true, data: [] },
			localPartner: { success: true, data: [] },
		};
	}
	const session = await getSessionByTypeOrThrow('user');
	const programs = await programService.getOptions(session.id);
	const localPartner = await localPartnerService.getOptions();
	return { programs, localPartner };
};

export const importRecipientsCsvAction = async (file: File, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await recipientService.importCsv(session, file);
	if (session.type === 'user') {
		revalidatePath(PORTAL_RECIPIENTS_PATH);
		revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_RECIPIENTS_PATH);
	}
	return result;
};

