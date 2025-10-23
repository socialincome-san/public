import { Address, Gender, Phone, Prisma, ProgramPermission, RecipientStatus } from '@prisma/client';

export type RecipientPayload = {
	id: string;
	startDate: Date | null;
	status: RecipientStatus;
	successorName: string | null;
	termsAccepted: boolean;
	localPartner: {
		id: string;
		name: string;
	};
	program: {
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
};

export type RecipientTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	age: number | null;
	status: RecipientStatus;
	payoutsReceived: number;
	payoutsTotal: number;
	payoutsProgressPercent: number;
	localPartnerName: string;
	programName: string;
	programId: string;
	permission: ProgramPermission;
};

export type RecipientTableView = {
	tableRows: RecipientTableViewRow[];
};

export type RecipientCreateInput = Prisma.RecipientCreateInput;
export type RecipientUpdateInput = Prisma.RecipientUpdateInput;
