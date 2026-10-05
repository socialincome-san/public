import type { ContributorReferralSource, CountryCode, Gender } from '@/generated/prisma/enums';

export type ContributorCommunityStats = {
	supporterCount: number;
	countryCount: number;
};

export type ContributorTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	firebaseAuthUserId: string;
	country: CountryCode | null;
	totalContributedChf: number;
	createdAt: Date;
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
	contact: ContributorContact;
};

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
	address: ContributorAddress | null;
	authId: string;
};

export type ContributorRecord = {
	id: string;
	legacyFirestoreId: string | null;
	accountId: string;
	contactId: string;
	referral: ContributorReferralSource;
	needsOnboarding: boolean;
	paymentReferenceId: string | null;
	stripeCustomerId: string | null;
	createdAt: Date;
	updatedAt: Date | null;
};

export type ContributorWithContact = ContributorRecord & {
	contact: ContributorContactRecord & {
		address: ContributorAddress | null;
	};
};

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

export type CampaignGuestAccountData = {
	email: string;
	firstName: string;
	lastName: string;
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

export type ContributorUpdateUniquenessContext = {
	existingContactId: string;
	existingEmail: string | null;
	existingPhoneId: string | null;
	existingPhoneNumber: string | null;
};

type ContributorContact = {
	id: string;
	firstName: string;
	lastName: string;
	callingName: string | null;
	email: string | null;
	gender: Gender | null;
	language: string | null;
	dateOfBirth: Date | null;
	profession: string | null;
	phone: ContributorPhone | null;
	address: ContributorAddress | null;
};

type ContributorAddress = {
	id: string;
	street: string;
	number: string;
	city: string;
	zip: string;
	country: CountryCode | null;
	createdAt: Date;
	updatedAt: Date | null;
};

type ContributorPhone = {
	id: string;
	number: string;
	hasWhatsApp: boolean;
	createdAt: Date;
	updatedAt: Date | null;
};

type ContributorContactRecord = {
	id: string;
	firstName: string;
	lastName: string;
	callingName: string | null;
	email: string | null;
	gender: Gender | null;
	language: string | null;
	dateOfBirth: Date | null;
	profession: string | null;
	phoneId: string | null;
	addressId: string | null;
	isInstitution: boolean;
	createdAt: Date;
	updatedAt: Date | null;
};
