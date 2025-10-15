import { Gender, Prisma } from '@prisma/client';

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
		firstName: string;
		lastName: string;
		gender?: Gender;
		profession?: string;
		phone?: string;
		dateofBirth?: Date;
		email: string;
		callingName?: string;
	};
};

export type LocalPartnerCreateInput = Prisma.LocalPartnerCreateInput;
