import { ProgramAccess, ProgramPermission } from '@prisma/client';

export const programAccessesData: ProgramAccess[] = [
	{
		id: 'program-access-1',
		userAccountId: 'user-account-1',
		programId: 'program-1',
		permissions: [ProgramPermission.admin]
	},
	{
		id: 'program-access-2',
		userAccountId: 'user-account-2',
		programId: 'program-2',
		permissions: [ProgramPermission.audit]
	},
	{
		id: 'program-access-3',
		userAccountId: 'user-account-3',
		programId: 'program-3',
		permissions: [ProgramPermission.admin]
	}
];