import { User, UserRole } from '@prisma/client';

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export type UserInformation = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	organizationNames: string[];
	role: UserRole;
};

export type UserTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	organizationName: string;
};

export type UserTableView = {
	tableRows: UserTableViewRow[];
};
