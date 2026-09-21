'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail } from '@/lib/service-result';
import { revalidatePath } from 'next/cache';
import {
	localPartnerCreateSchema,
	localPartnerIdSchema,
	localPartnerSessionTypeSchema,
	localPartnerUpdateSchema,
} from './local-partner.schemas';
import {
	createLocalPartner,
	deleteLocalPartner,
	getLocalPartner,
	getPublicLocalPartnersByProgramId,
	updateLocalPartner,
} from './local-partner.service';

export const createLocalPartnerAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const inputResult = localPartnerCreateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await createLocalPartner(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/admin/local-partners');

	return result;
};

export const updateLocalPartnerAction = async (input: unknown, sessionType: unknown = 'user') => {
	const sessionTypeResult = localPartnerSessionTypeSchema.safeParse(sessionType);
	if (!sessionTypeResult.success) {
		return resultFail('Invalid session type');
	}
	const sessionResult = await getSessionByType(sessionTypeResult.data);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const inputResult = localPartnerUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await updateLocalPartner(sessionResult.data, inputResult.data);
	if (sessionResult.data.type === 'user') {
		revalidatePath('/portal/admin/local-partners');
	} else if (sessionResult.data.type === 'local-partner') {
		revalidatePath('/partner-space/profile');
	}

	return result;
};

export const getLocalPartnerAction = async (localPartnerId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const idResult = localPartnerIdSchema.safeParse(localPartnerId);
	if (!idResult.success) {
		return resultFail(idResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	return getLocalPartner(sessionResult.data.id, idResult.data);
};

export const deleteLocalPartnerAction = async (localPartnerId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const idResult = localPartnerIdSchema.safeParse(localPartnerId);
	if (!idResult.success) {
		return resultFail(idResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await deleteLocalPartner(sessionResult.data.id, idResult.data);
	revalidatePath('/portal/admin/local-partners');

	return result;
};

export const getPublicLocalPartnersByProgramIdAction = async (programId: unknown) => {
	const idResult = localPartnerIdSchema.safeParse(programId);
	if (!idResult.success) {
		return resultFail('Missing program id');
	}

	return getPublicLocalPartnersByProgramId(idResult.data);
};
