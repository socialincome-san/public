import { OrganizationPermission, UserRole } from '@prisma/client';

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

export type AllUsersTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	organizations: string[];
};

export type AllUsersTableView = {
	tableRows: AllUsersTableViewRow[];
};

export type OrganizationMembersTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	permission: OrganizationPermission;
};

export type OrganizationMembersTableView = {
	tableRows: OrganizationMembersTableViewRow[];
	userPermission: OrganizationPermission;
};
