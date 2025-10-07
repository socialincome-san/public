import { ProgramAccess, ProgramPermission } from '@prisma/client';

export const programAccessesData: ProgramAccess[] = [
	{
		id: 'program-access-1',
		userId: 'user-1',
		programId: 'program-1',
		permissions: [ProgramPermission.edit]
	},
	{
		id: 'program-access-2',
		userId: 'user-1',
		programId: 'program-3',
		permissions: [ProgramPermission.readonly]
	},
	{
		id: 'program-access-3',
		userId: 'user-1',
		programId: 'program-4',
		permissions: [ProgramPermission.readonly]
	},
	{
		id: 'program-access-4',
		userId: 'user-2',
		programId: 'program-2',
		permissions: [ProgramPermission.edit]
	},
	{
		id: 'program-access-5',
		userId: 'user-3',
		programId: 'program-3',
		permissions: [ProgramPermission.edit]
	}
];