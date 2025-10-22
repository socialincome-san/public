import { OrganizationPermission, UserRole } from '@prisma/client';

export type UserOrganization = {
	id: string;
	name: string;
};

export type UserInformation = {
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
