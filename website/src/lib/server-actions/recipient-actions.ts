'use server';

import { getSessionByType, type Session } from '@/lib/firebase/current-account';
import { resultFail, resultOk } from '@/lib/services/core/service-result';
import { RecipientFormCreateInput, RecipientFormUpdateInput } from '@/lib/services/recipient/recipient-form-input';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

const PORTAL_RECIPIENTS_PATH = '/portal/management/recipients';
const PORTAL_PROGRAM_RECIPIENTS_PATH = '/portal/programs/[programId]/recipients';
const PORTAL_MONITORING_UPCOMING_ONBOARDING_PATH = '/portal/monitoring/upcoming-onboarding';
const PARTNER_RECIPIENTS_PATH = '/partner-space/recipients';

export const createRecipientAction = async (recipient: RecipientFormCreateInput, sessionType: Session['type'] = 'user') => {
	const sessionResult = await getSessionByType(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	const result = await services.write.recipient.create(session, recipient);
	if (session.type === 'user') {
		revalidatePath(PORTAL_RECIPIENTS_PATH);
		revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');
		revalidatePath(PORTAL_MONITORING_UPCOMING_ONBOARDING_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_RECIPIENTS_PATH);
	}

	return result;
};

export const updateRecipientAction = async (
	updateInput: RecipientFormUpdateInput,
	sessionType: Session['type'] = 'user',
) => {
	const sessionResult = await getSessionByType(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	const result = await services.write.recipient.update(session, updateInput);
	if (session.type === 'user') {
		revalidatePath(PORTAL_RECIPIENTS_PATH);
		revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');
		revalidatePath(PORTAL_MONITORING_UPCOMING_ONBOARDING_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_RECIPIENTS_PATH);
	}

	return result;
};

export const deleteRecipientAction = async (recipientId: string, sessionType: Session['type'] = 'user') => {
	const sessionResult = await getSessionByType(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	const result = await services.write.recipient.delete(session, recipientId);
	if (session.type === 'user') {
		revalidatePath(PORTAL_RECIPIENTS_PATH);
		revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');
		revalidatePath(PORTAL_MONITORING_UPCOMING_ONBOARDING_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_RECIPIENTS_PATH);
	}

	return result;
};

export const getRecipientAction = async (recipientId: string, sessionType: Session['type'] = 'user') => {
	const sessionResult = await getSessionByType(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;

	return await services.read.recipient.get(session, recipientId);
};

export const getRecipientOptions = async (sessionType: Session['type'] = 'user') => {
	if (sessionType !== 'user') {
		return resultOk({ programs: [], localPartner: [] });
	}
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	const programs = await services.read.program.getOptions(session.id);
	if (!programs.success) {
		return resultFail(programs.error);
	}
	const localPartner = await services.read.localPartner.getOptions();
	if (!localPartner.success) {
		return resultFail(localPartner.error);
	}

	return resultOk({ programs: programs.data, localPartner: localPartner.data });
};

export const importRecipientsCsvAction = async (file: File, sessionType: Session['type'] = 'user') => {
	const sessionResult = await getSessionByType(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	const result = await services.write.recipient.importCsv(session, file);
	if (session.type === 'user') {
		revalidatePath(PORTAL_RECIPIENTS_PATH);
		revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');
		revalidatePath(PORTAL_MONITORING_UPCOMING_ONBOARDING_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_RECIPIENTS_PATH);
	}

	return result;
};

export const downloadRecipientsCsvAction = async (sessionType: Session['type'] = 'user') => {
	const sessionResult = await getSessionByType(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;

	return services.read.recipient.exportCsv(session);
};
