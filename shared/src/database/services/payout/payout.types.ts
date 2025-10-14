import { Gender, PayoutStatus, ProgramPermission } from '@prisma/client';

export type PayoutMonth = {
	monthLabel: string;
	status: PayoutStatus;
};

export type OngoingPayoutTableViewRow = {
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

export type OngoingPayoutTableView = {
	tableRows: OngoingPayoutTableViewRow[];
};

export type PayoutConfirmationTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	paymentAt: Date;
	paymentAtFormatted: string;
	status: PayoutStatus;
	programName: string;
	permission: ProgramPermission;
};

export type PayoutConfirmationTableView = {
	tableRows: PayoutConfirmationTableViewRow[];
};
