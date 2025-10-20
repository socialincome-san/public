import { OrganizationAccess, OrganizationPermission } from '@prisma/client';

export const organizationAccessesData: OrganizationAccess[] = [
	{
		id: 'organization-access-1',
		userId: 'user-1',
		organizationId: 'organization-1',
		permissions: [OrganizationPermission.edit],
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'organization-access-2',
		userId: 'user-2',
		organizationId: 'organization-2',
		permissions: [OrganizationPermission.edit],
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'organization-access-3',
		userId: 'user-3',
		organizationId: 'organization-3',
		permissions: [OrganizationPermission.edit],
		createdAt: new Date(),
		updatedAt: null
	}
];