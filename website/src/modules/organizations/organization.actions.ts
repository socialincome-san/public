'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail, type ServiceResult } from '@/lib/service-result';
import { revalidatePath } from 'next/cache';
import {
	organizationCreateSchema,
	organizationIdSchema,
	organizationRenameSchema,
	organizationUpdateSchema,
} from './organization.schemas';
import {
	createOrganization,
	deleteOrganization,
	getOrganization,
	getOrganizationProgramOptions,
	getOrganizationUserOptions,
	renameActiveOrganization,
	updateOrganization,
} from './organization.service';
import type { OrganizationPayload } from './organization.types';

const REVALIDATE_PATH = '/portal/admin/organizations';

export const createOrganizationAction = async (input: unknown): Promise<ServiceResult<OrganizationPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsedInput = organizationCreateSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await createOrganization(sessionResult.data.id, parsedInput.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const updateOrganizationAction = async (input: unknown): Promise<ServiceResult<OrganizationPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsedInput = organizationUpdateSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await updateOrganization(sessionResult.data.id, parsedInput.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const renameActiveOrganizationAction = async (
	input: unknown,
): Promise<ServiceResult<{ id: string; name: string }>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsedInput = organizationRenameSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await renameActiveOrganization(sessionResult.data.id, parsedInput.data);
	revalidatePath('/portal');
	revalidatePath('/portal/profile/account');
	revalidatePath('/portal/profile/organization');

	return result;
};

export const deleteOrganizationAction = async (organizationId: unknown): Promise<ServiceResult<void>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsedOrganizationId = organizationIdSchema.safeParse(organizationId);
	if (!parsedOrganizationId.success) {
		return resultFail(parsedOrganizationId.error.issues[0]?.message ?? 'Invalid organization id.');
	}

	const result = await deleteOrganization(sessionResult.data.id, parsedOrganizationId.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getOrganizationAction = async (organizationId: unknown): Promise<ServiceResult<OrganizationPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsedOrganizationId = organizationIdSchema.safeParse(organizationId);
	if (!parsedOrganizationId.success) {
		return resultFail(parsedOrganizationId.error.issues[0]?.message ?? 'Invalid organization id.');
	}

	return getOrganization(sessionResult.data.id, parsedOrganizationId.data);
};

export const getOrganizationUserOptionsAction = async (): Promise<ServiceResult<{ id: string; name: string }[]>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getOrganizationUserOptions(sessionResult.data.id);
};

export const getOrganizationProgramOptionsAction = async (): Promise<ServiceResult<{ id: string; name: string }[]>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getOrganizationProgramOptions(sessionResult.data.id);
};
