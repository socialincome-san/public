import type { UserRole } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';

export type OrganizationMemberTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: UserRole | null;
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

export type OrganizationPayload = {
	id: string;
	name: string;
	userIds: string[];
	ownedProgramIds: string[];
	operatedProgramIds: string[];
};

export type ActiveOrganizationSummary = {
	id: string;
	name: string;
};

export type OrganizationWriteService = {
	createFromEmail: (email: string) => Promise<ServiceResult<OrganizationPayload>>;
};
