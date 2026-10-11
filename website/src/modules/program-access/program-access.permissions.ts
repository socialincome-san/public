import { ProgramPermission } from '@/generated/prisma/enums';
import type { ProgramAccesses } from './program-access.types';

export const hasOperatorAccess = (accesses: ProgramAccesses, programId: string): boolean =>
	accesses.some((access) => access.programId === programId && access.permission === ProgramPermission.operator);

export const hasAnyOperatorAccess = (accesses: ProgramAccesses): boolean =>
	accesses.some((access) => access.permission === ProgramPermission.operator);
