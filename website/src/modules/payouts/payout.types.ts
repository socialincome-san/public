import type { Currency, PayoutStatus, ProgramPermission } from '@/generated/prisma/enums';

export const PAYOUT_FORECAST_MONTHS_AHEAD = 6;

export type PayoutRecord = {
	id: string;
	legacyFirestoreId: string | null;
	amount: string;
	amountChf: string | null;
	currency: Currency;
	paymentAt: Date;
	status: PayoutStatus;
	phoneNumber: string | null;
	comments: string | null;
	recipientId: string;
	createdAt: Date;
	updatedAt: Date | null;
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
	amountChf: number | null;
	currency: Currency;
	status: PayoutStatus;
	paymentAt: Date;
	phoneNumber: string | null;
	comments: string | null;
};

export type PayoutTableViewRow = {
	id: string;
	recipientFirstName: string;
	recipientLastName: string;
	programName: string;
	mobileMoneyProviderName: string | null;
	amount: number;
	currency: Currency;
	status: PayoutStatus;
	paymentAt: Date;
};

export type PayoutTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	programId?: string;
	payoutStatus?: string;
	mobileMoneyProviderId?: string;
};

export type PayoutPaginatedTableView = {
	tableRows: PayoutTableViewRow[];
	totalCount: number;
	programFilterOptions: { id: string; name: string }[];
	statusFilterOptions: { value: string; label: string }[];
	mobileMoneyProviderFilterOptions: { id: string; name: string }[];
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
	programFilterOptions: { id: string; name: string }[];
	statusFilterOptions: { value: string; label: string }[];
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
	programFilterOptions: { id: string; name: string }[];
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

export type CountryPayoutTotals = {
	totalPayoutsChf: number;
};
