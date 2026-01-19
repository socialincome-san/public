import { Address, Cause, Gender, Phone, Prisma } from '@prisma/client';

export type LocalPartnerTableViewRow = {
	id: string;
	name: string;
	contactPerson: string;
	contactNumber: string | null;
	recipientsCount: number;
	createdAt: Date;
};

export type LocalPartnerTableView = {
	tableRows: LocalPartnerTableViewRow[];
};

export type LocalPartnerPayload = {
	id: string;
	name: string;
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

export type LocalPartnerCreateInput = Omit<Prisma.LocalPartnerCreateInput, 'account' | 'accountId'>;
export type LocalPartnerUpdateInput = Omit<Prisma.LocalPartnerUpdateInput, 'account' | 'accountId'>;

export type LocalPartnerSession = {
	type: 'local-partner';
	id: string;
	name: string;
	causes: Cause[];
	email: string | null;
	firstName: string | null;
	lastName: string | null;
	language: string | null;
	phone: string | null;
	country: string | null;
};
