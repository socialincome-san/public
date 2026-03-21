'use server';

import type { ProgramBudgetCalculationInput } from '@/lib/services/program-stats/program-stats.types';
import { services } from '@/lib/services/services';

export const calculateProgramBudgetAction = async (input: ProgramBudgetCalculationInput) => {
	return services.programStats.calculateProgramBudget(input);
};
