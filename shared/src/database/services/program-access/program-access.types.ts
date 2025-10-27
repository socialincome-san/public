import { ProgramPermission } from '@prisma/client';

export type ProgramAccess = {
	programId: string;
	permission: ProgramPermission;
};

export type ProgramAccesses = ProgramAccess[];
