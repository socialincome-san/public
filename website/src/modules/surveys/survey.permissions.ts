import { ProgramPermission } from '@/generated/prisma/enums';
import type { ProgramAccesses } from '@/modules/program-access/program-access.types';

export const hasSurveyProgramAccess = (accesses: ProgramAccesses, programId: string): boolean =>
	accesses.some((access) => access.programId === programId);

export const hasSurveyOperatorAccess = (accesses: ProgramAccesses, programId: string): boolean =>
	accesses.some((access) => access.programId === programId && access.permission === ProgramPermission.operator);
