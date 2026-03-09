'use server';

import { getSessionByTypeOrThrow, type Session } from '@/lib/firebase/current-account';
import { getServices } from '@/lib/services/services';
import { RecipientCreateInput, RecipientUpdateInput } from '@/lib/services/recipient/recipient.types';
import { revalidatePath } from 'next/cache';

const PORTAL_RECIPIENTS_PATH = '/portal/management/recipients';
const PORTAL_PROGRAM_RECIPIENTS_PATH = '/portal/programs/[programId]/recipients';
const PARTNER_RECIPIENTS_PATH = '/partner-space/recipients';

export const createRecipientAction = async (recipient: RecipientCreateInput, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await getServices().recipientWrite.create(session, recipient);
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
	const result = await getServices().recipientWrite.update(session, updateInput, nextPaymentPhoneNumber);
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
	const result = await getServices().recipientWrite.delete(session, recipientId);
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
	return await getServices().recipientRead.get(session, recipientId);
};

export const getRecipientOptions = async (sessionType: Session['type'] = 'user') => {
	if (sessionType !== 'user') {
		return {
			programs: { success: true, data: [] },
			localPartner: { success: true, data: [] },
		};
	}
	const session = await getSessionByTypeOrThrow('user');
	const programs = await getServices().programRead.getOptions(session.id);
	const localPartner = await getServices().localPartnerRead.getOptions();
	return { programs, localPartner };
};

export const importRecipientsCsvAction = async (file: File, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await getServices().recipientWrite.importCsv(session, file);
	if (session.type === 'user') {
		revalidatePath(PORTAL_RECIPIENTS_PATH);
		revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_RECIPIENTS_PATH);
	}
	return result;
};

export const downloadRecipientsCsvAction = async (sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	return getServices().recipientRead.exportCsv(session);
};

export const createRecipientAction = async (recipient: RecipientCreateInput, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await recipientWriteService.create(session, recipient);
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
	const result = await recipientWriteService.update(session, updateInput, nextPaymentPhoneNumber);
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
	const result = await recipientWriteService.delete(session, recipientId);
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
	return await recipientReadService.get(session, recipientId);
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
	const result = await recipientWriteService.importCsv(session, file);
	if (session.type === 'user') {
		revalidatePath(PORTAL_RECIPIENTS_PATH);
		revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_RECIPIENTS_PATH);
	}
	return result;
};

export const downloadRecipientsCsvAction = async (sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	return recipientReadService.exportCsv(session);
};
