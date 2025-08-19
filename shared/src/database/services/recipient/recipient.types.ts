import { Recipient, RecipientStatus } from '@prisma/client';

export type CreateRecipientInput = Omit<Recipient, 'id' | 'createdAt' | 'updatedAt'>;

export type ProgramPermission = 'operator' | 'viewer';

export type RecipientTableViewRow = {
	id: string;
	status: RecipientStatus;
	localPartnerName: string;
	firstName: string;
	lastName: string;
	age: number | null;
	payoutsReceived: number;
	payoutsTotal: number;
	payoutsProgressPercent: number;
};

export type RecipientTableViewWithPermission = {
	tableRows: RecipientTableViewRow[];
	programPermission: ProgramPermission;
};
