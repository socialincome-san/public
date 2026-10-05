import { ProgramPermission } from '@/generated/prisma/enums';
import type { ProgramAccesses } from '@/modules/program-access/program-access.types';

export const canListSubscriptions = (accessiblePrograms: ProgramAccesses): boolean =>
	accessiblePrograms.some((program) => program.permission === ProgramPermission.operator);
