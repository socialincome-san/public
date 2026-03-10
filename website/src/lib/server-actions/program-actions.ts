'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { services } from '@/lib/services/services';
import type { CreateProgramInput } from '../services/program/program.types';

export const createProgramAction = async (input: CreateProgramInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.write.program.create(sessionResult.data.id, input);
};
