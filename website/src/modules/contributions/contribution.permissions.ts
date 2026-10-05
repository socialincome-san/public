import { ProgramPermission } from '@/generated/prisma/enums';
import type { ProgramAccesses } from '@/modules/program-access/program-access.types';

export const canReadContribution = (accessiblePrograms: ProgramAccesses, programId: string): boolean =>
	accessiblePrograms.some((program) => program.programId === programId);

export const canListContributions = (accessiblePrograms: ProgramAccesses): boolean =>
	hasAnyOperatorAccess(accessiblePrograms);

export const canWriteContribution = (accessiblePrograms: ProgramAccesses, programId: string): boolean =>
	hasOperatorAccess(accessiblePrograms, programId);

const hasAnyOperatorAccess = (accessiblePrograms: ProgramAccesses): boolean =>
	accessiblePrograms.some((program) => program.permission === ProgramPermission.operator);

const hasOperatorAccess = (accessiblePrograms: ProgramAccesses, programId: string): boolean =>
	accessiblePrograms.some((program) => program.programId === programId && program.permission === ProgramPermission.operator);
