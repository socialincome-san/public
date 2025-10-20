import { Address, Gender, Phone, Prisma } from '@prisma/client';

export type LocalPartnerTableViewRow = {
	id: string;
	name: string;
	contactPerson: string;
	contactNumber: string | null;
	recipientsCount: number;
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
		email: string;
		gender: Gender | null;
		language: string | null;
		dateOfBirth: Date | null;
		profession: string | null;
		phone: Phone | null;
		address: Address | null;
	};
};

export type LocalPartnerCreateInput = Prisma.LocalPartnerCreateInput;
export type LocalPartnerUpdateInput = Prisma.LocalPartnerUpdateInput;
