import { Gender, Phone, Prisma } from '@prisma/client';

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
		gender?: Gender;
		profession?: string;
		phone?: Phone;
		dateOfBirth?: Date;
		email: string;
		callingName?: string;
		language?: string;
	};
};

export type LocalPartnerCreateInput = Prisma.LocalPartnerCreateInput;
export type LocalPartnerUpdateInput = Prisma.LocalPartnerUpdateInput;
