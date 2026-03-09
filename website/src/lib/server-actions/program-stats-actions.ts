'use server';

import type { ProgramBudgetCalculationInput } from '@/lib/services/program-stats/program-stats.types';
import { getServices } from '@/lib/services/services';
import { getAuthenticatedUserOrThrow } from '../firebase/current-user';

export const calculateProgramBudgetAction = async (input: ProgramBudgetCalculationInput) => {
	await getAuthenticatedUserOrThrow();
	return getServices().programStats.calculateProgramBudget(input);
};

export const calculateProgramBudgetAction = async (input: ProgramBudgetCalculationInput) => {
	await getAuthenticatedUserOrThrow();
	return service.calculateProgramBudget(input);
};
