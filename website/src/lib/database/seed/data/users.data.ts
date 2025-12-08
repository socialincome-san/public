import { User, UserRole } from '@prisma/client';

export const usersData: User[] = [
	{
		id: 'user-1',
		accountId: 'account-1',
		contactId: 'contact-16',
		role: UserRole.admin,
		activeOrganizationId: 'organization-1',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'user-2',
		accountId: 'account-2',
		contactId: 'contact-17',
		role: UserRole.admin,
		activeOrganizationId: 'organization-1',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'user-3',
		accountId: 'account-3',
		contactId: 'contact-18',
		role: UserRole.user,
		activeOrganizationId: 'organization-3',
		createdAt: new Date(),
		updatedAt: null
	}
];