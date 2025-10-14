import { ProgramAccess, ProgramPermission } from '@prisma/client';

export const programAccessesData: ProgramAccess[] = [
	{
		id: 'program-access-1',
		userId: 'user-1',
		programId: 'program-1',
		permissions: [ProgramPermission.edit],
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'program-access-2',
		userId: 'user-1',
		programId: 'program-2',
		permissions: [ProgramPermission.edit],
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'program-access-3',
		userId: 'user-1',
		programId: 'program-4',
		permissions: [ProgramPermission.readonly],
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'program-access-4',
		userId: 'user-1',
		programId: 'program-5',
		permissions: [ProgramPermission.readonly],
		createdAt: new Date(),
		updatedAt: null
	}
];