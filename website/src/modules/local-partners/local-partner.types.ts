import type { CountryCode, Gender } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';

type ContactPhone = {
	id: string;
	number: string;
	hasWhatsApp: boolean;
	createdAt: Date;
	updatedAt: Date | null;
};

type ContactAddress = {
	id: string;
	street: string;
	number: string;
	city: string;
	zip: string;
	country: CountryCode | null;
	createdAt: Date;
	updatedAt: Date | null;
};

export type LocalPartnerTableViewRow = {
	id: string;
	name: string;
	contactPerson: string;
	email: string | null;
	firebaseAuthUserId: string;
	contactNumber: string | null;
	focuses: string;
	recipientsCount: number;
	candidatesCount: number;
	createdAt: Date;
	country: CountryCode | null;
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
	slug: string;
	focuses: string[];
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
		phone: ContactPhone | null;
		address: ContactAddress | null;
	};
};

export type LocalPartnerOption = {
	id: string;
	name: string;
};

type PublicLocalPartnerStats = {
	assignedRecipientsCount: number;
	waitingRecipientsCount: number;
};

export type PublicLocalPartnerStatsMap = Record<string, PublicLocalPartnerStats>;

type PublicLocalPartnerOverviewStats = {
	recipientsCount: number;
	candidatesCount: number;
};

export type PublicLocalPartnerOverviewStatsMap = Record<string, PublicLocalPartnerOverviewStats>;

export type PublicProgramLocalPartner = {
	id: string;
	name: string;
	slug: string;
};

export type LocalPartnerSession = {
	type: 'local-partner';
	id: string;
	name: string;
	focuses: string[];
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

export type LocalPartnerReadService = {
	getPaginatedTableView: (
		userId: string,
		query: LocalPartnerTableQuery,
	) => Promise<ServiceResult<LocalPartnerPaginatedTableView>>;
};
