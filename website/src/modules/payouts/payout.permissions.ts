import { ProgramPermission } from '@/generated/prisma/enums';
import type { ProgramAccesses } from '@/modules/program-access/program-access.types';

export const canReadPayout = (accessiblePrograms: ProgramAccesses, programId: string): boolean =>
	accessiblePrograms.some((program) => program.programId === programId);

export const canWritePayout = (accessiblePrograms: ProgramAccesses, programId: string): boolean =>
	accessiblePrograms.some((program) => program.programId === programId && program.permission === ProgramPermission.operator);
