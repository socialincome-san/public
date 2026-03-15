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

export type OrganizationMemberTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type OrganizationMemberPaginatedTableView = {
	tableRows: OrganizationMemberTableViewRow[];
	totalCount: number;
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

export type OrganizationTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type OrganizationPaginatedTableView = {
	tableRows: OrganizationTableViewRow[];
	totalCount: number;
};

export type OrganizationOption = {
	id: string;
	name: string;
};
