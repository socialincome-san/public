import { UserRole } from '@prisma/client';

export type UserPayload = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string | null;
	role: UserRole;
	organizationId: string | null;
};

export type UserCreateInput = {
	firstName: string;
	lastName: string;
	email: string;
	role: UserRole;
	organizationId: string;
};

export type UserUpdateInput = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: UserRole;
	organizationId: string;
};

export type UserTableViewRow = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string | null;
	role: UserRole;
	organizationName: string | null;
	createdAt: Date;
};

export type UserTableView = {
	tableRows: UserTableViewRow[];
};

export type UserSession = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	role: UserRole;
	activeOrganization: {
		id: string;
		name: string;
	} | null;
	organizations: {
		id: string;
		name: string;
	}[];
	programs: {
		id: string;
		name: string;
	}[];
};
