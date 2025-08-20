import { Gender, PayoutStatus } from '@prisma/client';

export type ProgramPermission = 'operator' | 'viewer';

export type PayoutMonth = {
	monthLabel: string;
	status: PayoutStatus;
};

export type PayoutTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	gender: Gender;
	programName: string;

	payoutsReceived: number;
	payoutsTotal: number;
	payoutsProgressPercent: number;
	paymentsLeft: number;

	last3Months: PayoutMonth[];
	permission: ProgramPermission;
};

export type PayoutTableView = {
	tableRows: PayoutTableViewRow[];
};
