'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import type { CreateProgramInput } from '../services/program/program.types';

export const createProgramAction = async (input: CreateProgramInput) => {
	const user = await getAuthenticatedUserOrThrow();

	return services.program.create(user.id, input);
};
