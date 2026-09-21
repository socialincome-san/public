import type { ProgramPermission } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';

export type ProgramAccess = {
	programId: string;
	programName: string;
	permission: ProgramPermission;
};

export type ProgramAccesses = ProgramAccess[];

export type CreateInitialProgramAccessesInput = {
	programId: string;
	ownerOrganizationId: string;
	operatorFallbackOrganizationId: string;
};

export type ProgramAccessReadService = {
	getAccessiblePrograms: (userId: string) => Promise<ServiceResult<ProgramAccesses>>;
	hasOperatorAccess: (accesses: ProgramAccesses, programId: string) => boolean;
	hasAnyOperatorAccess: (accesses: ProgramAccesses) => boolean;
};
