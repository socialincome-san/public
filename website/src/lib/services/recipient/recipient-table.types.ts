import { CountryCode, ProgramPermission } from '@/generated/prisma/client';

export type RecipientTableViewRow = {
	id: string;
	country: CountryCode | null;
	firstName: string;
	lastName: string;
	paymentCode: string | null;
	dateOfBirth: Date | null;
	startDate: Date | null;
	localPartnerName: string | null;
	suspendedAt: Date | null;
	suspensionReason: string | null;
	programId: string | null;
	programName: string | null;
	payoutsReceived: number;
	payoutsTotal: number;
	payoutsProgressPercent: number;
	createdAt: Date;
	permission: ProgramPermission;
};

export type RecipientTableView = {
	tableRows: RecipientTableViewRow[];
	permission: ProgramPermission;
};

export type RecipientTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	programId?: string;
};

export type RecipientProgramFilterOption = {
	id: string;
	name: string;
};

export type RecipientPaginatedTableView = {
	tableRows: RecipientTableViewRow[];
	totalCount: number;
	permission: ProgramPermission;
	programFilterOptions: RecipientProgramFilterOption[];
};
