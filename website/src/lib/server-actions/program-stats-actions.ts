'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import type { ProgramBudgetCalculationInput } from '@/lib/services/program-stats/program-stats.types';
import { services } from '@/lib/services/services';

export const calculateProgramBudgetAction = async (input: ProgramBudgetCalculationInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.programStats.calculateProgramBudget(input);
};
