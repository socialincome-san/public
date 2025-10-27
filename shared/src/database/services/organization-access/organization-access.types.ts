import { OrganizationPermission } from '@prisma/client';

export type ActiveOrganizationAccess = {
	id: string;
	permission: OrganizationPermission;
};
