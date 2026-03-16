'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { services } from '@/lib/services/services';
import type { CreateProgramInput, PublicOnboardingUserDetails } from '../services/program/program.types';

export const createProgramAction = async (input: CreateProgramInput, userDetails?: PublicOnboardingUserDetails) => {
	const sessionResult = await getSessionByType('user');
	if (sessionResult.success) {
		return services.write.program.create(input, { userId: sessionResult.data.id });
	}

	if (userDetails) {
		return services.write.program.create(input, userDetails);
	}

	return sessionResult;
};
