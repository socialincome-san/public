import { Currency, PayoutStatus, Prisma, ProgramPermission } from '@/generated/prisma/client';

export type PayoutEntity = Prisma.PayoutGetPayload<Prisma.PayoutDefaultArgs>;

export type PayoutTableViewRow = {
	id: string;
	recipientFirstName: string;
	recipientLastName: string;
	programName: string;
	amount: number;
	currency: Currency;
	status: PayoutStatus;
	paymentAt: Date;
	permission: ProgramPermission;
};

type PayoutTableView = {
	tableRows: PayoutTableViewRow[];
};

export type PayoutTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	programId?: string;
	payoutStatus?: string;
};

export type PayoutPaginatedTableView = {
	tableRows: PayoutTableViewRow[];
	totalCount: number;
	programFilterOptions: {
		id: string;
		name: string;
	}[];
	statusFilterOptions: {
		value: string;
		label: string;
	}[];
};

export type PayoutConfirmationTableViewRow = {
	id: string;
	recipientFirstName: string;
	recipientLastName: string;
	programName: string;
	amount: number;
	currency: Currency;
	status: PayoutStatus;
	paymentAt: Date;
	phoneNumber: string | null;
	permission: ProgramPermission;
};

type PayoutConfirmationTableView = {
	tableRows: PayoutConfirmationTableViewRow[];
};

export type PayoutConfirmationTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	programId?: string;
	payoutStatus?: string;
};

export type PayoutConfirmationPaginatedTableView = {
	tableRows: PayoutConfirmationTableViewRow[];
	totalCount: number;
	programFilterOptions: {
		id: string;
		name: string;
	}[];
	statusFilterOptions: {
		value: string;
		label: string;
	}[];
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

type OngoingPayoutTableView = {
	tableRows: OngoingPayoutTableViewRow[];
};

export type OngoingPayoutTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	programId?: string;
};

export type OngoingPayoutPaginatedTableView = {
	tableRows: OngoingPayoutTableViewRow[];
	totalCount: number;
	programFilterOptions: {
		id: string;
		name: string;
	}[];
};

export type PayoutForecastTableViewRow = {
	period: string;
	numberOfRecipients: number;
	amountInProgramCurrency: number;
	amountUsd: number;
	programCurrency: Currency;
};

export type PayoutForecastTableView = {
	tableRows: PayoutForecastTableViewRow[];
};

export type PayoutForecastTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type PayoutForecastPaginatedTableView = {
	tableRows: PayoutForecastTableViewRow[];
	totalCount: number;
};

export type PayoutPayload = {
	id: string;
	recipient: {
		id: string;
		firstName: string;
		lastName: string;
		programId: string | null;
		programName: string | null;
	};
	amount: number;
	currency: Currency;
	status: PayoutStatus;
	paymentAt: Date;
	phoneNumber: string | null;
	comments: string | null;
};

export type PayoutCreateInput = {
	recipient: { connect: { id: string } };
	amount: number;
	currency: Currency;
	status: PayoutStatus;
	paymentAt: Date;
	phoneNumber?: string | null;
	comments?: string | null;
};

export type PayoutUpdateInput = {
	id: string;
	amount?: number;
	currency?: Currency;
	status?: PayoutStatus;
	paymentAt?: Date;
	phoneNumber?: string | null;
	comments?: string | null;
	recipient?: { connect: { id: string } };
};
