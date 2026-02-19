import { ProgramPermission } from '@/generated/prisma/client';

type ProgramAccess = {
  programId: string;
  programName: string;
  permission: ProgramPermission;
};

export type ProgramAccesses = ProgramAccess[];
