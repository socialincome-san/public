import { UserAccount, UserAccountRole } from '@prisma/client';

export const userAccountsData: UserAccount[] = [
	{
		id: 'user-account-1',
		firebaseAuthUserId: 'w43IydQbr8lgeGeevbSBoP9ui3WQ',
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
	},
	{
		id: 'user-account-4',
		firebaseAuthUserId: 'firebase-auth-user-4',
		role: UserAccountRole.user,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'user-account-5',
		firebaseAuthUserId: 'firebase-auth-user-5',
		role: UserAccountRole.user,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'user-account-6',
		firebaseAuthUserId: 'firebase-auth-user-6',
		role: UserAccountRole.user,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'user-account-7',
		firebaseAuthUserId: 'firebase-auth-user-7',
		role: UserAccountRole.user,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'user-account-8',
		firebaseAuthUserId: 'firebase-auth-user-8',
		role: UserAccountRole.user,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'user-account-9',
		firebaseAuthUserId: 'firebase-auth-user-9',
		role: UserAccountRole.user,
		createdAt: new Date(),
		updatedAt: null
	}
];