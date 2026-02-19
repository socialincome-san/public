import { ProgramAccess, ProgramPermission } from '@/generated/prisma/client';

export const programAccessesData: ProgramAccess[] = [
  {
    id: 'program-access-1',
    organizationId: 'organization-1',
    programId: 'program-1',
    permission: ProgramPermission.operator,
    createdAt: new Date('2024-03-12T12:00:00.000Z'),
    updatedAt: null,
  },
  {
    id: 'program-access-2',
    organizationId: 'organization-1',
    programId: 'program-2',
    permission: ProgramPermission.operator,
    createdAt: new Date('2024-03-12T12:00:00.000Z'),
    updatedAt: null,
  },
  {
    id: 'program-access-3',
    organizationId: 'organization-1',
    programId: 'program-4',
    permission: ProgramPermission.owner,
    createdAt: new Date('2024-03-12T12:00:00.000Z'),
    updatedAt: null,
  },
  {
    id: 'program-access-4',
    organizationId: 'organization-1',
    programId: 'program-5',
    permission: ProgramPermission.owner,
    createdAt: new Date('2024-03-12T12:00:00.000Z'),
    updatedAt: null,
  },
];
