import { Address, CountryCode, Gender, Phone } from '@/generated/prisma/client';

export enum Profile {
	male = 'male',
	female = 'female',
	youth = 'youth',
}

export type CandidatePayload = {
	id: string;
	suspendedAt: Date | null;
	suspensionReason: string | null;
	successorName: string | null;
	termsAccepted: boolean;
	localPartner: {
		id: string;
		name: string;
	};
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
	paymentInformation: {
		id: string;
		code: string | null;
		mobileMoneyProvider: { id: string; name: string } | null;
		phone: Phone | null;
	} | null;
};

export type CandidatesTableViewRow = {
	id: string;
	country: CountryCode | null;
	firstName: string;
	lastName: string;
	dateOfBirth: Date | null;
	contactNumber: string | null;
	gender: Gender | null;
	localPartnerName: string | null;
	suspendedAt: Date | null;
	suspensionReason: string | null;
};

export type CandidatesTableView = {
	tableRows: CandidatesTableViewRow[];
};

export type CandidatesTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	country?: string;
	gender?: string;
	localPartnerId?: string;
};

export type CandidatesPaginatedTableView = {
	tableRows: CandidatesTableViewRow[];
	totalCount: number;
	countryFilterOptions: {
		value: string;
		label: string;
	}[];
	genderFilterOptions: {
		value: string;
		label: string;
	}[];
	localPartnerFilterOptions: {
		value: string;
		label: string;
	}[];
};

