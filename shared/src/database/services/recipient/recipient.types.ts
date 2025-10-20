import { ProgramPermission, RecipientStatus } from '@prisma/client';

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
