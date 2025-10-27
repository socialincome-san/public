import { ProgramPermission } from '@prisma/client';

export type AccessibleProgram = {
	programId: string;
	permission: ProgramPermission;
};

export type AccessibleProgramsResult = AccessibleProgram[];
