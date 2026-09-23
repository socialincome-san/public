import type { CountryCode } from '@/generated/prisma/enums';

export type FocusTableViewRow = {
	id: string;
	name: string;
	createdAt: Date;
};

export type FocusTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type FocusPaginatedTableView = {
	tableRows: FocusTableViewRow[];
	totalCount: number;
};

export type FocusPayload = {
	id: string;
	name: string;
	slug: string;
	createdAt: Date;
	updatedAt: Date | null;
};

export type FocusOption = {
	id: string;
	name: string;
};

type PublicFocusStats = {
	programsCount: number;
	recipientsInProgramsCount: number;
	candidatesCount: number;
	countryIsoCodes: CountryCode[];
};

export type PublicFocusStatsBySlugMap = Record<string, PublicFocusStats>;
