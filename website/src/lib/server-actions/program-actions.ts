'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';
import type { CreateProgramInput, ProgramSettingsUpdateInput } from '../services/program/program.types';

export const createProgramAction = async (input: CreateProgramInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.write.program.create(sessionResult.data.id, input);
};

export const getProgramSettingsAction = async (programId: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.read.program.getSettings(sessionResult.data.id, programId);
};

export const getProgramOrganizationOptionsAction = async (programId: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.read.program.getSettingsOrganizationOptions(sessionResult.data.id, programId);
};

export const updateProgramSettingsAction = async (input: ProgramSettingsUpdateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const result = await services.write.program.updateSettings(sessionResult.data.id, input);
	if (result.success) {
		revalidatePath('/portal/programs/[programId]', 'layout');
	}

	return result;
};
