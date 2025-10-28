import { PayoutStatus, ProgramPermission } from '@prisma/client';

export type PayoutTableViewRow = {
	id: string;
	recipientFirstName: string;
	recipientLastName: string;
	programName: string;
	amount: number;
	currency: string;
	status: PayoutStatus;
	paymentAt: Date;
	permission: ProgramPermission;
};

export type PayoutTableView = {
	tableRows: PayoutTableViewRow[];
};

export type PayoutMonth = {
	monthLabel: string;
	status: PayoutStatus | null;
};

export type OngoingPayoutTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	programName: string;
	payoutsReceived: number;
	payoutsTotal: number;
	payoutsProgressPercent: number;
	last3Months: PayoutMonth[];
	createdAt: Date;
	permission: ProgramPermission;
};

export type OngoingPayoutTableView = {
	tableRows: OngoingPayoutTableViewRow[];
};

export type PayoutForecastTableViewRow = {
	period: string;
	numberOfRecipients: number;
	amountInProgramCurrency: number;
	amountUsd: number;
	programCurrency: string;
};

export type PayoutForecastTableView = {
	tableRows: PayoutForecastTableViewRow[];
};
