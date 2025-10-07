import { UserAccount, UserAccountRole } from '@prisma/client';

export const userAccountsData: UserAccount[] = [
	{
		id: 'user-account-1',
		firebaseAuthUserId: 'firebase-auth-user-1',
		role: UserAccountRole.admin,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'user-account-2',
		firebaseAuthUserId: 'firebase-auth-user-2',
		role: UserAccountRole.admin,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'user-account-3',
		firebaseAuthUserId: 'firebase-auth-user-3',
		role: UserAccountRole.admin,
		createdAt: new Date(),
		updatedAt: null
	}
];