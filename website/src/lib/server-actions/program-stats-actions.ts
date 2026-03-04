'use server';

import { ProgramStatsService } from '@/lib/services/program-stats/program-stats.service';
import type { ProgramBudgetCalculationInput } from '@/lib/services/program-stats/program-stats.types';
import { getAuthenticatedUserOrThrow } from '../firebase/current-user';

const service = new ProgramStatsService();

export const calculateProgramBudgetAction = async (input: ProgramBudgetCalculationInput) => {
	await getAuthenticatedUserOrThrow();
	return service.calculateProgramBudget(input);
};
