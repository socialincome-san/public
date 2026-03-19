'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import type {
	OrganizationFormCreateInput,
	OrganizationFormUpdateInput,
	OrganizationRenameInput,
} from '@/lib/services/organization/organization-form-input';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/organizations';

export const createOrganizationAction = async (input: OrganizationFormCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.organization.create(sessionResult.data.id, input);
	revalidatePath(REVALIDATE_PATH);

	return res;
};

export const updateOrganizationAction = async (input: OrganizationFormUpdateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.organization.update(sessionResult.data.id, input);
	revalidatePath(REVALIDATE_PATH);

	return res;
};

export const renameActiveOrganizationAction = async (input: OrganizationRenameInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const res = await services.write.organization.renameActiveOrganization(sessionResult.data.id, input);
	revalidatePath('/portal');
	revalidatePath('/portal/profile/account');
	revalidatePath('/portal/profile/organization');

	return res;
};

export const deleteOrganizationAction = async (id: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.organization.delete(sessionResult.data.id, id);
	revalidatePath(REVALIDATE_PATH);

	return res;
};

export const getOrganizationAction = async (id: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.read.organization.get(sessionResult.data.id, id);
};

export const getOrganizationUserOptionsAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.read.organization.getUserOptions(sessionResult.data.id);
};

export const getOrganizationProgramOptionsAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.read.organization.getProgramOptions(sessionResult.data.id);
};
