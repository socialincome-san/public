'use server';

import type { ProgramBudgetCalculationInput } from '@/lib/services/program-stats/program-stats.types';
import { services } from '@/lib/services/services';
import { getAuthenticatedUserOrThrow } from '../firebase/current-user';

export const calculateProgramBudgetAction = async (input: ProgramBudgetCalculationInput) => {
	await getAuthenticatedUserOrThrow();
	return services.programStats.calculateProgramBudget(input);
};
