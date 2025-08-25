import { User as PrismaUser, UserRole } from '@prisma/client';

export type CreateUserInput = Omit<PrismaUser, 'id' | 'createdAt' | 'updatedAt'>;

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
