import { UserRole } from '@prisma/client';

export type UserOrganization = {
	id: string;
	name: string;
	memberCount: number;
};

export type UserInformation = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	role: UserRole;
	organizations: UserOrganization[];
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
