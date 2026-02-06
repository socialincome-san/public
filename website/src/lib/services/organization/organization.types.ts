import { OrganizationPermission, UserRole } from '@/generated/prisma/client';

export type OrganizationMemberTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: UserRole | null;
	permission: OrganizationPermission;
};

export type OrganizationMemberTableView = {
	tableRows: OrganizationMemberTableViewRow[];
};

export type OrganizationTableViewRow = {
	id: string;
	name: string;
	ownedProgramsCount: number;
	operatedProgramsCount: number;
	usersCount: number;
	createdAt: Date;
};

export type OrganizationTableView = {
	tableRows: OrganizationTableViewRow[];
};

export type OrganizationOption = {
	id: string;
	name: string;
};
