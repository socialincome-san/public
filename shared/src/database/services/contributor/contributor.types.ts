import { Address, ContributorReferralSource, Gender, OrganizationPermission, Phone, Prisma } from '@prisma/client';

export type ContributorTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	country: string | null;
	createdAt: Date;
	permission: OrganizationPermission;
};

export type ContributorTableView = {
	tableRows: ContributorTableViewRow[];
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
export type ContributorCreateInput = Prisma.ContributorCreateInput;

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
};

export type ContributorSession = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	stripeCustomerId: string | null;
};
