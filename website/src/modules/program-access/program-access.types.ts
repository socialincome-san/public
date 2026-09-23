import type { ProgramPermission } from '@/generated/prisma/enums';

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
