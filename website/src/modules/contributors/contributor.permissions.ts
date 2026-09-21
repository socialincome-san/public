import { ProgramPermission } from '@/generated/prisma/enums';
import type { ProgramAccesses } from '@/modules/program-access/program-access.types';

export const canCreateContributor = (accessiblePrograms: ProgramAccesses): boolean =>
	hasAnyOperatorAccess(accessiblePrograms);

export const canListContributors = (accessiblePrograms: ProgramAccesses): boolean =>
	hasAnyOperatorAccess(accessiblePrograms);

export const canReadContributor = (accessiblePrograms: ProgramAccesses): boolean => accessiblePrograms.length > 0;

export const canUpdateContributor = (accessiblePrograms: ProgramAccesses, contributorProgramIds: string[]): boolean => {
	if (!hasAnyOperatorAccess(accessiblePrograms)) {
		return false;
	}

	if (contributorProgramIds.length === 0) {
		return true;
	}

	return contributorProgramIds.some((programId) => hasOperatorAccess(accessiblePrograms, programId));
};

const hasAnyOperatorAccess = (accessiblePrograms: ProgramAccesses): boolean =>
	accessiblePrograms.some((program) => program.permission === ProgramPermission.operator);

const hasOperatorAccess = (accessiblePrograms: ProgramAccesses, programId: string): boolean =>
	accessiblePrograms.some((program) => program.programId === programId && program.permission === ProgramPermission.operator);
