import { PayoutStatus, Prisma, ProgramPermission } from '@prisma/client';

export type PayoutEntity = Prisma.PayoutGetPayload<{}>;

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

export type PayoutConfirmationTableViewRow = {
	id: string;
	recipientFirstName: string;
	recipientLastName: string;
	programName: string;
	amount: number;
	currency: string;
	status: PayoutStatus;
	paymentAt: Date;
	phoneNumber: string | null;
	permission: ProgramPermission;
};

export type PayoutConfirmationTableView = {
	tableRows: PayoutConfirmationTableViewRow[];
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

export type PreviewPayout = {
	recipientId: string;
	firstName: string;
	lastName: string;
	phoneNumber: string | null;
	currency: string;
	amount: number;
	amountChf: number | null;
	paymentAt: Date;
	status: PayoutStatus;
};

export type RecipientCompletionPreview = {
	id: string;
	firstName: string;
	lastName: string;
	paidCount: number;
	totalPayments: number;
	remaining: number;
	isCompleted: boolean;
};

export type PayoutPayload = {
	id: string;
	recipient: {
		id: string;
		firstName: string;
		lastName: string;
		programId: string;
		programName: string;
	};
	amount: number;
	currency: string;
	status: PayoutStatus;
	paymentAt: Date;
	phoneNumber: string | null;
	comments: string | null;
};

export type PayoutCreateInput = {
	recipient: { connect: { id: string } };
	amount: number;
	currency: string;
	status: PayoutStatus;
	paymentAt: Date;
	phoneNumber?: string | null;
	comments?: string | null;
};

export type PayoutUpdateInput = {
	id: string;
	amount?: number;
	currency?: string;
	status?: PayoutStatus;
	paymentAt?: Date;
	phoneNumber?: string | null;
	comments?: string | null;
	recipient?: { connect: { id: string } };
};
