import { ProgramPermission } from '@prisma/client';

export type ProgramAccess = {
	programId: string;
	programName: string;
	permission: ProgramPermission;
};

export type ProgramAccesses = ProgramAccess[];
