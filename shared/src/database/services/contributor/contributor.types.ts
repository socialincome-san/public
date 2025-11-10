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
export type ContributorOption = {
	id: string;
	name: string;
};
