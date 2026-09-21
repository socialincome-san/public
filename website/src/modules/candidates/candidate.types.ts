import type { CountryCode, Gender, Profile } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';

type CandidatePhone = {
	id: string;
	number: string;
	hasWhatsApp: boolean;
	createdAt: Date;
	updatedAt: Date | null;
};

type CandidateAddress = {
	id: string;
	street: string;
	number: string;
	city: string;
	zip: string;
	country: CountryCode | null;
	createdAt: Date;
	updatedAt: Date | null;
};

export type CandidatePayload = {
	id: string;
	suspendedAt: Date | null;
	suspensionReason: string | null;
	successorName: string | null;
	termsAccepted: boolean;
	localPartner: { id: string; name: string };
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
		phone: CandidatePhone | null;
		address: CandidateAddress | null;
	};
	paymentInformation: {
		id: string;
		code: string | null;
		mobileMoneyProvider: { id: string; name: string } | null;
		phone: CandidatePhone | null;
	} | null;
};

export type CandidatesTableViewRow = {
	id: string;
	firebaseAuthUserId: string;
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

type CandidateFilterOption = {
	value: string;
	label: string;
};

export type CandidatesPaginatedTableView = {
	tableRows: CandidatesTableViewRow[];
	totalCount: number;
	countryFilterOptions: CandidateFilterOption[];
	genderFilterOptions: CandidateFilterOption[];
	localPartnerFilterOptions: CandidateFilterOption[];
};

export type CandidateAssignmentService = {
	assignRandomCandidatesToProgram: (
		programId: string,
		amountOfRecipientsForStart: number,
		countryCode: CountryCode,
		focuses?: string[],
		profiles?: Profile[],
	) => Promise<ServiceResult<{ assigned: number }>>;
};
