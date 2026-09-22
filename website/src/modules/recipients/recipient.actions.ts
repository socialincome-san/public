'use server';

import { getSessionByType, type Session } from '@/lib/firebase/current-account';
import { resultFail } from '@/lib/service-result';
import { revalidatePath } from 'next/cache';
import {
	publicRecipientProgramIdSchema,
	recipientCreateSchema,
	recipientCsvFileSchema,
	recipientIdSchema,
	recipientSessionTypeSchema,
	recipientUpdateSchema,
} from './recipient.schemas';
import {
	createRecipient,
	deleteRecipient,
	exportRecipientsCsv,
	getPublicRecipientsTableView,
	getRecipientById,
	getRecipientFormOptions,
	importRecipientsCsv,
	removeRecipientFromProgram,
	updateRecipient,
} from './recipient.service';

export const createRecipientAction = async (input: unknown, sessionType: unknown = 'user') => {
	const sessionResult = await getRecipientActionSession(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = recipientCreateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await createRecipient(sessionResult.data, inputResult.data);
	revalidateRecipientPaths(sessionResult.data.type);

	return result;
};

export const updateRecipientAction = async (input: unknown, sessionType: unknown = 'user') => {
	const sessionResult = await getRecipientActionSession(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = recipientUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await updateRecipient(sessionResult.data, inputResult.data);
	revalidateRecipientPaths(sessionResult.data.type);

	return result;
};

export const removeRecipientFromProgramAction = async (recipientId: unknown, sessionType: unknown = 'user') => {
	const sessionResult = await getRecipientActionSession(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}

	const recipientIdResult = recipientIdSchema.safeParse(recipientId);
	if (!recipientIdResult.success) {
		return resultFail(recipientIdResult.error.issues[0]?.message ?? 'Recipient id is required.');
	}

	const result = await removeRecipientFromProgram(sessionResult.data, recipientIdResult.data);
	revalidateRecipientPaths(sessionResult.data.type);

	return result;
};

export const deleteRecipientAction = async (recipientId: unknown, sessionType: unknown = 'user') => {
	const sessionResult = await getRecipientActionSession(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}

	const recipientIdResult = recipientIdSchema.safeParse(recipientId);
	if (!recipientIdResult.success) {
		return resultFail(recipientIdResult.error.issues[0]?.message ?? 'Recipient id is required.');
	}

	const result = await deleteRecipient(sessionResult.data, recipientIdResult.data);
	revalidateRecipientPaths(sessionResult.data.type);

	return result;
};

export const getRecipientAction = async (recipientId: unknown, sessionType: unknown = 'user') => {
	const sessionResult = await getRecipientActionSession(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}

	const recipientIdResult = recipientIdSchema.safeParse(recipientId);
	if (!recipientIdResult.success) {
		return resultFail(recipientIdResult.error.issues[0]?.message ?? 'Recipient id is required.');
	}

	return getRecipientById(sessionResult.data, recipientIdResult.data);
};

export const getRecipientOptionsAction = async (sessionType: unknown = 'user') => {
	const sessionResult = await getRecipientActionSession(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getRecipientFormOptions(sessionResult.data);
};

export const importRecipientsCsvAction = async (file: unknown, sessionType: unknown = 'user') => {
	const sessionResult = await getRecipientActionSession(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}

	const fileResult = recipientCsvFileSchema.safeParse(file);
	if (!fileResult.success) {
		return resultFail(fileResult.error.issues[0]?.message ?? 'Invalid CSV file');
	}

	const result = await importRecipientsCsv(sessionResult.data, fileResult.data);
	revalidateRecipientPaths(sessionResult.data.type);

	return result;
};

export const downloadRecipientsCsvAction = async (sessionType: unknown = 'user') => {
	const sessionResult = await getRecipientActionSession(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}

	return exportRecipientsCsv(sessionResult.data);
};

export const getPublicRecipientsTableAction = async (programId: unknown) => {
	const programIdResult = publicRecipientProgramIdSchema.safeParse(programId);
	if (!programIdResult.success) {
		return resultFail(programIdResult.error.issues[0]?.message ?? 'Invalid program id');
	}

	return getPublicRecipientsTableView(programIdResult.data);
};

const getRecipientActionSession = async (sessionType: unknown) => {
	const sessionTypeResult = recipientSessionTypeSchema.safeParse(sessionType);
	if (!sessionTypeResult.success) {
		return resultFail('Invalid session type');
	}

	return getSessionByType(sessionTypeResult.data);
};

const revalidateRecipientPaths = (sessionType: Session['type']): void => {
	if (sessionType === 'user') {
		revalidatePath('/portal/management/recipients');
		revalidatePath('/portal/programs/[programId]/recipients', 'page');
		revalidatePath('/portal/monitoring/upcoming-onboarding');
	}

	if (sessionType === 'local-partner') {
		revalidatePath('/partner-space/recipients');
	}
};
