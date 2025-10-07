import { UserAccount, UserAccountRole } from '@prisma/client';

export type CreateUserAccountInput = Omit<UserAccount, 'id' | 'createdAt' | 'updatedAt'>;

export type UserInformation = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	organizationNames: string[];
	role: UserAccountRole;
};

export type UserTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	role: UserAccountRole;
	organizationName: string;
	readonly: boolean;
};

export type UserTableView = {
	tableRows: UserTableViewRow[];
};
