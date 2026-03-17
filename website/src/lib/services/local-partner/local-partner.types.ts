import { Address, Cause, CountryCode, Gender, Phone } from '@/generated/prisma/client';

export type LocalPartnerTableViewRow = {
	id: string;
	name: string;
	contactPerson: string;
	email: string | null;
	firebaseAuthUserId: string;
	contactNumber: string | null;
	causes: string;
	recipientsCount: number;
	createdAt: Date;
};

export type LocalPartnerTableView = {
	tableRows: LocalPartnerTableViewRow[];
};

export type LocalPartnerTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type LocalPartnerPaginatedTableView = {
	tableRows: LocalPartnerTableViewRow[];
	totalCount: number;
};

export type LocalPartnerPayload = {
	id: string;
	name: string;
	causes: Cause[];
	contact: {
		id: string;
		firstName: string;
		lastName: string;
		callingName: string | null;
		email: string | null;
		gender: Gender | null;
		language: string | null;
		dateOfBirth: Date | null;
		profession: string | null;
		phone: Phone | null;
		address: Address | null;
	};
};

export type LocalPartnerOption = {
	id: string;
	name: string;
};

export type LocalPartnerSession = {
	type: 'local-partner';
	id: string;
	name: string;
	causes: Cause[];
	gender: Gender | null;
	email: string | null;
	firstName: string | null;
	lastName: string | null;
	language: string | null;
	street: string | null;
	number: string | null;
	city: string | null;
	zip: string | null;
	country: CountryCode | null;
};
