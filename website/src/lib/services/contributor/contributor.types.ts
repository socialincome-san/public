import {
	Address,
	ContributorReferralSource,
	CountryCode,
	Gender,
	OrganizationPermission,
	Phone,
	Prisma,
} from '@/generated/prisma/client';

export type ContributorTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	country: CountryCode | null;
	createdAt: Date;
	permission: OrganizationPermission;
};

type ContributorTableView = {
	tableRows: ContributorTableViewRow[];
};

export type ContributorTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	country?: string;
};

export type ContributorPaginatedTableView = {
	tableRows: ContributorTableViewRow[];
	totalCount: number;
	countryFilterOptions: {
		value: string;
		label: string;
	}[];
};

export type ContributorPayload = {
	id: string;
	referral: ContributorReferralSource;
	paymentReferenceId: string | null;
	stripeCustomerId: string | null;
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
		address: Address | null;
		phone: Phone | null;
	};
};

export type ContributorUpdateInput = Prisma.ContributorUpdateInput;

export type ContributorOption = {
	id: string;
	name: string;
};

export type ContributorDonationCertificate = {
	id: string;
	firstName: string;
	lastName: string;
	email: string | null;
	language: string | null;
	address: Address | null;
	authId: string;
};

export type ContributorWithContact = Prisma.ContributorGetPayload<{
	include: { contact: true };
}>;

export type StripeContributorData = {
	stripeCustomerId: string;
	email: string;
	firstName: string;
	lastName: string;
	referral: ContributorReferralSource;
};

export type BankContributorData = {
	paymentReferenceId: string;
	email: string;
	firstName: string;
	lastName: string;
	language: string;
};

export type ContributorSession = {
	type: 'contributor';
	id: string;
	gender: Gender | null;
	referral: ContributorReferralSource;
	email: string | null;
	firstName: string | null;
	lastName: string | null;
	language: string | null;
	street: string | null;
	number: string | null;
	city: string | null;
	zip: string | null;
	country: CountryCode | null;
	stripeCustomerId: string | null;
};

