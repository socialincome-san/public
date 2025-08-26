import { User as PrismaUser, UserRole } from '@prisma/client';

export type CreateUserInput = Omit<PrismaUser, 'id' | 'createdAt' | 'updatedAt'>;

export type UserInformation = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	organizationName: string | null;
	role: UserRole;
};

export type UserTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	organizationName: string;
	readonly: boolean;
};

export type UserTableView = {
	tableRows: UserTableViewRow[];
};
