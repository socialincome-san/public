import { ProgramPermission, RecipientStatus } from '@prisma/client';

export type RecipientTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	dateOfBirth: Date | null;
	localPartnerName: string | null;
	status: RecipientStatus;
	programId: string | null;
	programName: string | null;
	payoutsReceived: number;
	payoutsTotal: number;
	payoutsProgressPercent: number;
	createdAt: Date;
	permission: ProgramPermission;
};

export type RecipientTableView = {
	tableRows: RecipientTableViewRow[];
};
