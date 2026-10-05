import { UserRole } from '@/generated/prisma/enums';

export const canRenameOrganization = (role: UserRole, hasOperatorProgramAccess: boolean): boolean =>
	role === UserRole.admin || hasOperatorProgramAccess;
