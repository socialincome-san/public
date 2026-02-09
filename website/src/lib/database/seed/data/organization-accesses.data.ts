import { OrganizationAccess, OrganizationPermission } from '@/generated/prisma/client';

export const organizationAccessesData: OrganizationAccess[] = [
	{
		id: 'organization-access-1',
		userId: 'user-1',
		organizationId: 'organization-1',
		permission: OrganizationPermission.edit,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'organization-access-2',
		userId: 'user-2',
		organizationId: 'organization-1',
		permission: OrganizationPermission.edit,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'organization-access-3',
		userId: 'user-2',
		organizationId: 'organization-3',
		permission: OrganizationPermission.edit,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'organization-access-4',
		userId: 'user-1',
		organizationId: 'organization-5',
		permission: OrganizationPermission.readonly,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	}
];