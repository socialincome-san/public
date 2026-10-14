import { ProgramPermission } from '@/generated/prisma/enums';
import type { ProgramAccesses } from '@/modules/program-access/program-access.types';

export const hasOperatorAccess = (accessiblePrograms: ProgramAccesses, programId: string): boolean =>
	accessiblePrograms.some((access) => access.programId === programId && access.permission === ProgramPermission.operator);
