import { Prisma, Recipient, RecipientStatus } from '@prisma/client';
import RecipientGetPayload = Prisma.RecipientGetPayload;

export type CreateRecipientInput = Omit<Recipient, 'id' | 'createdAt' | 'updatedAt'>;

export type ProgramPermission = 'operator' | 'viewer';

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

export type RecipientWithPayouts = RecipientGetPayload<{ include: { payouts: true } }>;
